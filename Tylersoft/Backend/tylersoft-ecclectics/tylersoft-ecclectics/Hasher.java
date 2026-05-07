import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Hasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        System.out.println("AdminPass123!: " + encoder.encode("AdminPass123!"));
        System.out.println("UserPass123!: " + encoder.encode("UserPass123!"));
    }
}
