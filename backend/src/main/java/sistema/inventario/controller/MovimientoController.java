package sistema.inventario.controller;

import sistema.inventario.model.Movimiento;
import sistema.inventario.model.Producto;
import sistema.inventario.model.Usuario;
import sistema.inventario.repository.MovimientoRepository;
import sistema.inventario.repository.ProductoRepository;
import sistema.inventario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoController {

    private final MovimientoRepository movRepo;
    private final ProductoRepository prodRepo;
    private final UsuarioRepository usuarioRepo;

    public MovimientoController(
            MovimientoRepository movRepo,
            ProductoRepository prodRepo,
            UsuarioRepository usuarioRepo) {
        this.movRepo = movRepo;
        this.prodRepo = prodRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @GetMapping
    public List<Movimiento> listar() {
        return movRepo.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrar(@RequestBody Movimiento mov) {
        if (mov.getIdProducto() == null || mov.getIdUsuario() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar un producto y un usuario");
        }
        if (mov.getCantidad() == null || mov.getCantidad() <= 0) {
            return ResponseEntity.badRequest().body("La cantidad debe ser mayor que cero");
        }

        String tipo = mov.getTipo() == null ? "" : mov.getTipo().toUpperCase();
        if (!"ENTRADA".equals(tipo) && !"SALIDA".equals(tipo)) {
            return ResponseEntity.badRequest().body("Tipo inválido. Debe ser ENTRADA o SALIDA");
        }

        Optional<Producto> prodOpt = prodRepo.findById(mov.getIdProducto());
        if (prodOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado");
        }

        Producto p = prodOpt.get();

        if ("SALIDA".equals(tipo)) {
            if (p.getStock() < mov.getCantidad()) {
                return ResponseEntity.badRequest().body("Stock insuficiente para realizar la salida");
            }
        }

        Optional<Usuario> usuarioOpt = usuarioRepo.findById(mov.getIdUsuario());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        mov.setTipo(tipo);
        Movimiento guardado = movRepo.save(mov);
        return ResponseEntity.ok(guardado);
    }
}