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
 * Unified UI Block Engine V10.4 — Advanced Table Reconstruction
 * Optimized for technical specification tables (Response Codes, Parameter
 * Lists, etc.)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentParserService {

    private final ObjectMapper objectMapper;

    // Patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile("(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b");
    private static final Pattern PHONE_PATTERN = Pattern
            .compile("(?i)\\b(\\+?\\d{1,3}[- ]?)?(\\d{10}|\\d{3}[- ]?\\d{3}[- ]?\\d{4})\\b");
    private static final Pattern LIST_PATTERN = Pattern.compile("^\\s*([\\*\\-•]|\\d+[\\.\\)])\\s+(.*)");
    private static final Pattern PAGE_NO_PATTERN = Pattern
            .compile("(?i)^(\\s*page\\s*\\d+.*|\\s*\\d+\\s*(of|\\/)\\s*\\d+\\s*|\\s*\\d+\\s*)$");

    // Improved Table Patterns
    private static final Pattern TABLE_COLUMN_PATTERN = Pattern.compile("(?i).*(\\s{2,}|\\t|\\|).*");
    private static final Pattern RESPONSE_CODE_ROW = Pattern.compile("^\\d{3}\\s+[A-Z].*");

    public String parseDocumentToJson(Path filePath) {
        try {
            String rawText = extractText(filePath);
            if (rawText == null || rawText.isBlank()) {
                return objectMapper.writeValueAsString(List.of(emptyMetadata()));
            }

            List<Map<String, Object>> blocks = buildV10Blocks(rawText);
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(blocks);
        } catch (Exception e) {
            log.error("V10.4 Engine failure", e);
            return "[]";
        }
    }

    private String extractText(Path filePath) throws IOException {
        try (PDDocument doc = Loader.loadPDF(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    private List<Map<String, Object>> buildV10Blocks(String text) {
        String[] lines = text.split("\\r?\\n");
        List<Map<String, Object>> blocks = new ArrayList<>();

        blocks.add(createMetadataBlock(lines));
        extractContactBlocks(text).ifPresent(blocks::add);

        StringBuilder paragraphBuffer = new StringBuilder();
        List<String> listItems = new ArrayList<>();
        boolean isOrdered = false;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || PAGE_NO_PATTERN.matcher(line).matches()) {
                flushParagraph(paragraphBuffer, blocks);
                flushList(listItems, isOrdered, blocks);
                continue;
            }

            // Heading Detection
            if (isHeading(line)) {
                flushParagraph(paragraphBuffer, blocks);
                flushList(listItems, isOrdered, blocks);
                blocks.add(createBlock("heading", line, 1.0));
                continue;
            }

            // List Detection
            Matcher lm = LIST_PATTERN.matcher(line);
            if (lm.matches()) {
                flushParagraph(paragraphBuffer, blocks);
                isOrdered = Character.isDigit(lm.group(1).charAt(0));
                listItems.add(lm.group(2));
                continue;
            }

            // Enhanced Table Detection
            if (isTableStart(line)) {
                flushParagraph(paragraphBuffer, blocks);
                flushList(listItems, isOrdered, blocks);

                List<String[]> tableRows = new ArrayList<>();
                while (i < lines.length && isTableLine(lines[i].trim())) {
                    tableRows.add(splitToColumns(lines[i].trim()));
                    i++;
                }
                i--;
                blocks.add(createTableBlock(tableRows));
                continue;
            }

            // Code Block Detection
            if (line.startsWith("{") || line.startsWith("[")) {
                flushParagraph(paragraphBuffer, blocks);
                flushList(listItems, isOrdered, blocks);
                String code = extractCodeBlock(lines, i);
                blocks.add(createCodeBlock(code));
                i += code.split("\n").length - 1;
                continue;
            }

            paragraphBuffer.append(line).append(" ");
        }

        flushParagraph(paragraphBuffer, blocks);
        flushList(listItems, isOrdered, blocks);

        return blocks;
    }

    private boolean isTableStart(String line) {
        return (TABLE_COLUMN_PATTERN.matcher(line).matches() && line.length() > 10)
                || RESPONSE_CODE_ROW.matcher(line).matches();
    }

    private boolean isTableLine(String line) {
        if (line.isEmpty())
            return false;
        return TABLE_COLUMN_PATTERN.matcher(line).matches() || RESPONSE_CODE_ROW.matcher(line).matches()
                || line.length() < 30;
    }

    private String[] splitToColumns(String line) {
        if (line.contains("|"))
            return line.split("\\|");
        if (line.contains("\t"))
            return line.split("\\t");
        if (line.contains("  "))
            return line.split("\\s{2,}");

        // Handle single-space code tables (e.g. "200 Success")
        if (RESPONSE_CODE_ROW.matcher(line).matches()) {
            return new String[] { line.substring(0, 3), line.substring(3).trim() };
        }
        return new String[] { line };
    }

    private Map<String, Object> createBlock(String type, String text, double confidence) {
        Map<String, Object> block = new LinkedHashMap<>();
        block.put("id", type + "-" + UUID.randomUUID().toString().substring(0, 8));
        block.put("type", type);
        block.put("level", type.equals("heading") ? 1 : null);
        block.put("text", text);
        block.put("items", null);
        block.put("ordered", null);
        block.put("table", null);
        block.put("image", null);
        block.put("metadata", null);
        block.put("contact", null);
        block.put("confidence", confidence);
        return block;
    }

    private Map<String, Object> createMetadataBlock(String[] lines) {
        Map<String, Object> block = createBlock("metadata", null, 1.0);
        Map<String, Object> meta = new HashMap<>();
        String title = "Untitled Specification";
        for (String l : lines)
            if (l.trim().length() > 5) {
                title = l.trim();
                break;
            }
        meta.put("title", title);
        meta.put("pages", (int) Math.ceil(lines.length / 45.0));
        block.put("metadata", meta);
        return block;
    }

    private Optional<Map<String, Object>> extractContactBlocks(String text) {
        Set<String> emails = new HashSet<>();
        Matcher em = EMAIL_PATTERN.matcher(text);
        while (em.find())
            emails.add(em.group());

        Set<String> phones = new HashSet<>();
        Matcher pm = PHONE_PATTERN.matcher(text);
        while (pm.find())
            phones.add(pm.group());

        if (emails.isEmpty() && phones.isEmpty())
            return Optional.empty();

        Map<String, Object> block = createBlock("contact", null, 0.95);
        Map<String, Object> contact = new HashMap<>();
        contact.put("emails", new ArrayList<>(emails));
        contact.put("phones", new ArrayList<>(phones));
        block.put("contact", contact);
        return Optional.of(block);
    }

    private void flushParagraph(StringBuilder buffer, List<Map<String, Object>> blocks) {
        String text = buffer.toString().trim();
        if (text.isEmpty())
            return;
        blocks.add(createBlock("paragraph", text, 0.85));
        buffer.setLength(0);
    }

    private void flushList(List<String> items, boolean ordered, List<Map<String, Object>> blocks) {
        if (items.isEmpty())
            return;
        Map<String, Object> block = createBlock("list", null, 1.0);
        block.put("items", new ArrayList<>(items));
        block.put("ordered", ordered);
        blocks.add(block);
        items.clear();
    }

    private Map<String, Object> createTableBlock(List<String[]> rows) {
        Map<String, Object> block = createBlock("table", null, 0.95);
        Map<String, Object> table = new HashMap<>();
        if (rows.isEmpty()) {
            table.put("headers", new ArrayList<>());
            table.put("rows", new ArrayList<>());
        } else {
            table.put("headers", Arrays.asList(rows.get(0)));
            List<List<String>> dataRows = new ArrayList<>();
            for (int i = 1; i < rows.size(); i++)
                dataRows.add(Arrays.asList(rows.get(i)));
            table.put("rows", dataRows);
        }
        block.put("table", table);
        return block;
    }

    private Map<String, Object> createCodeBlock(String code) {
        return createBlock("code", code, 1.0);
    }

    private String extractCodeBlock(String[] lines, int start) {
        StringBuilder sb = new StringBuilder();
        int braces = 0;
        for (int i = start; i < lines.length; i++) {
            String l = lines[i];
            sb.append(l).append("\n");
            braces += countChars(l, '{') - countChars(l, '}');
            if (braces <= 0 && l.contains("}"))
                break;
            if (i - start > 150)
                break;
        }
        return sb.toString().trim();
    }

    private boolean isHeading(String line) {
        String t = line.trim();
        if (t.length() < 3 || t.length() > 70)
            return false;
        return t.equals(t.toUpperCase()) && !t.contains(":") && !Character.isDigit(t.charAt(t.length() - 1));
    }

    private int countChars(String s, char c) {
        int r = 0;
        for (char x : s.toCharArray())
            if (x == c)
                r++;
        return r;
    }

    private Map<String, Object> emptyMetadata() {
        Map<String, Object> block = createBlock("metadata", null, 0.0);
        block.put("id", "no-content");
        Map<String, Object> meta = new HashMap<>();
        meta.put("title", "Empty Document");
        meta.put("pages", 0);
        block.put("metadata", meta);
        return block;
    }
}
