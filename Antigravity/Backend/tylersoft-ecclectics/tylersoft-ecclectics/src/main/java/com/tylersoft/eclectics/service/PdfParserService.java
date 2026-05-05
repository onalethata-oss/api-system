package com.tylersoft.eclectics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Converts an uploaded PDF document into a structured JSON array
 * that the frontend StructuredDocViewer can render.
 *
 * Output format (array of endpoint objects):
 * [
 *   {
 *     "title":       "Create User",
 *     "method":      "POST",
 *     "endpoint":    "/api/users",
 *     "description": "...",
 *     "parameters":  [ { "name": "...", "type": "...", "required": true, "description": "..." } ],
 *     "examples":    [ { "label": "Request", "language": "json", "code": "..." } ]
 *   }
 * ]
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PdfParserService {

    private final ObjectMapper objectMapper;

    // ── HTTP methods we recognise ─────────────────────────────────────
    private static final List<String> HTTP_METHODS =
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS");

    // ── Patterns ──────────────────────────────────────────────────────
    // Matches lines like:  POST /api/users  or  GET  /health
    private static final Pattern METHOD_ENDPOINT_LINE =
            Pattern.compile("^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\\s+(/\\S+).*$",
                    Pattern.CASE_INSENSITIVE);

    // Matches  Title: Create User  or  Method: POST
    private static final Pattern FIELD_LINE =
            Pattern.compile("^(Title|Method|Endpoint|Description|Request|Response|Example|Parameter):\\s*(.+)$",
                    Pattern.CASE_INSENSITIVE);

    // JSON-looking block (starts with { or [)
    private static final Pattern JSON_BLOCK =
            Pattern.compile("(?s)(\\{[^{}]{2,}\\}|\\[[^\\[\\]]{2,}\\])");

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────

    /**
     * Extracts text from a PDF file and converts it to a JSON string.
     *
     * @param filePath path to the saved PDF on disk
     * @return JSON string (array of endpoint objects), or null if parsing fails
     */
    public String parsePdfToJson(Path filePath) {
        try {
            String rawText = extractText(filePath);
            if (rawText == null || rawText.isBlank()) {
                log.warn("PdfParserService: no text extracted from {}", filePath);
                return null;
            }

            String cleaned = cleanText(rawText);
            List<Map<String, Object>> structured = structureText(cleaned);

            if (structured.isEmpty()) {
                log.warn("PdfParserService: no endpoints detected in {}", filePath);
                return null;
            }

            return objectMapper.writeValueAsString(structured);

        } catch (Exception e) {
            log.error("PdfParserService: failed to parse {}", filePath, e);
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 1 — EXTRACT TEXT
    // ─────────────────────────────────────────────────────────────────

    private String extractText(Path filePath) throws IOException {
        try (PDDocument doc = Loader.loadPDF(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 2 — CLEAN
    // ─────────────────────────────────────────────────────────────────

    private String cleanText(String raw) {
        return raw
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("[ \\t]+", " ")        // collapse horizontal whitespace
                .replaceAll("\n{3,}", "\n\n")       // collapse multiple blank lines
                .trim();
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 3 — STRUCTURE
    // ─────────────────────────────────────────────────────────────────

    /**
     * Converts cleaned plain text into a list of endpoint maps.
     *
     * Strategy:
     *  1. Look for explicit "Title: / Method: / Endpoint: / Description:" fields.
     *  2. Also scan for bare  "POST /path" lines.
     *  3. Collect description text and JSON examples that follow each header.
     */
    private List<Map<String, Object>> structureText(String text) {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] lines = text.split("\n");

        Map<String, Object> current = null;
        StringBuilder descBuffer = new StringBuilder();
        StringBuilder codeBuffer = new StringBuilder();
        boolean inCodeBlock = false;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            // ── Explicit field lines ──────────────────────────────────
            Matcher fieldMatcher = FIELD_LINE.matcher(line);
            if (fieldMatcher.matches()) {
                String field = fieldMatcher.group(1).toLowerCase();
                String value = fieldMatcher.group(2).trim();

                switch (field) {
                    case "title" -> {
                        flushCurrent(current, descBuffer, codeBuffer, result);
                        current = newEndpoint();
                        current.put("title", value);
                        descBuffer.setLength(0);
                        codeBuffer.setLength(0);
                        inCodeBlock = false;
                    }
                    case "method" -> {
                        if (current == null) { current = newEndpoint(); }
                        current.put("method", value.toUpperCase());
                    }
                    case "endpoint" -> {
                        if (current == null) { current = newEndpoint(); }
                        current.put("endpoint", value);
                    }
                    case "description" -> {
                        if (current == null) { current = newEndpoint(); }
                        descBuffer.append(value).append(" ");
                    }
                    case "request", "response", "example" -> {
                        if (current == null) break;
                        appendExample(current, field.equals("request") ? "Request" : "Response", value);
                    }
                    case "parameter" -> {
                        if (current == null) break;
                        appendParameter(current, value);
                    }
                }
                continue;
            }

            // ── Bare METHOD /path lines ───────────────────────────────
            Matcher methodMatcher = METHOD_ENDPOINT_LINE.matcher(line);
            if (methodMatcher.matches()) {
                flushCurrent(current, descBuffer, codeBuffer, result);
                current = newEndpoint();
                current.put("method",   methodMatcher.group(1).toUpperCase());
                current.put("endpoint", methodMatcher.group(2));
                descBuffer.setLength(0);
                codeBuffer.setLength(0);
                inCodeBlock = false;
                continue;
            }

            // ── JSON block detection ──────────────────────────────────
            if ((line.startsWith("{") || line.startsWith("[")) && current != null) {
                inCodeBlock = true;
                codeBuffer.setLength(0);
            }
            if (inCodeBlock) {
                codeBuffer.append(line).append("\n");
                if (line.equals("}") || line.equals("]")) {
                    String code = codeBuffer.toString().trim();
                    appendExample(current, "Example", code);
                    inCodeBlock = false;
                    codeBuffer.setLength(0);
                }
                continue;
            }

            // ── Plain text → accumulate as description ─────────────
            if (current != null) {
                descBuffer.append(line).append(" ");
            } else {
                // Before first endpoint: treat as a section title
                if (looksLikeHeading(line)) {
                    current = newEndpoint();
                    current.put("title", line);
                    descBuffer.setLength(0);
                }
            }
        }

        flushCurrent(current, descBuffer, codeBuffer, result);
        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void appendExample(Map<String, Object> endpoint, String label, String code) {
        List<Map<String, Object>> examples =
                (List<Map<String, Object>>) endpoint.computeIfAbsent("examples", k -> new ArrayList<>());

        // Try to pretty-print JSON code
        String formatted = code;
        try {
            Object parsed = objectMapper.readValue(code, Object.class);
            formatted = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(parsed);
        } catch (Exception ignored) { /* keep as-is */ }

        Map<String, Object> ex = new LinkedHashMap<>();
        ex.put("label",    label);
        ex.put("language", "json");
        ex.put("code",     formatted);
        examples.add(ex);
    }

    @SuppressWarnings("unchecked")
    private void appendParameter(Map<String, Object> endpoint, String raw) {
        // Expect format: "name (type) - description"  or just "name - description"
        List<Map<String, Object>> params =
                (List<Map<String, Object>>) endpoint.computeIfAbsent("parameters", k -> new ArrayList<>());

        Map<String, Object> param = new LinkedHashMap<>();
        Pattern p = Pattern.compile("^(\\S+)(?:\\s+\\(([^)]+)\\))?\\s*[-–]?\\s*(.*)$");
        Matcher m = p.matcher(raw.trim());
        if (m.matches()) {
            param.put("name",        m.group(1));
            param.put("type",        m.group(2) != null ? m.group(2) : "string");
            param.put("required",    false);
            param.put("description", m.group(3) != null ? m.group(3).trim() : "");
        } else {
            param.put("name",        raw);
            param.put("type",        "string");
            param.put("required",    false);
            param.put("description", "");
        }
        params.add(param);
    }

    private void flushCurrent(Map<String, Object> current,
                               StringBuilder descBuffer,
                               StringBuilder codeBuffer,
                               List<Map<String, Object>> result) {
        if (current == null) return;

        // Flush accumulated description
        String desc = descBuffer.toString().trim();
        if (!desc.isEmpty() && current.get("description") == null) {
            current.put("description", desc);
        }

        // Flush any open code block
        String code = codeBuffer.toString().trim();
        if (!code.isEmpty()) {
            appendExample(current, "Example", code);
        }

        // Only add if it has at least a title or endpoint
        if (current.containsKey("title") || current.containsKey("endpoint")) {
            // Ensure required keys exist
            current.putIfAbsent("title",       "");
            current.putIfAbsent("method",      "GET");
            current.putIfAbsent("endpoint",    "");
            current.putIfAbsent("description", "");
            current.putIfAbsent("parameters",  new ArrayList<>());
            current.putIfAbsent("examples",    new ArrayList<>());
            result.add(current);
        }
    }

    private Map<String, Object> newEndpoint() {
        return new LinkedHashMap<>();
    }

    private boolean looksLikeHeading(String line) {
        // Short, no sentence punctuation, not a common word fragment
        return line.length() < 80 && !line.endsWith(".") && !line.endsWith(",");
    }
}
