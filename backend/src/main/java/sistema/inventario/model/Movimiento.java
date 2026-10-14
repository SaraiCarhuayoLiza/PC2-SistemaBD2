package sistema.inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Data
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_producto", nullable = false)
    private Long idProducto;

    @Column(nullable = false)
    private String tipo; // 'ENTRADA' o 'SALIDA'

    @Column(nullable = false)
    private Integer cantidad;

    private String motivo;

    @Column(name = "id_usuario")
    private Long idUsuario;

    private LocalDateTime fecha = LocalDateTime.now();
}