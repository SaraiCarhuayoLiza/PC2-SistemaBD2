package sistema.inventario.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    private String nombre;
    private BigDecimal precio;
    private Integer stock;

    @Column(name = "id_categoria", nullable = false)
    private Integer idCategoria;
}