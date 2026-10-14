package sistema.inventario.controller;

import sistema.inventario.model.Movimiento;
import sistema.inventario.model.Producto;
import sistema.inventario.repository.MovimientoRepository;
import sistema.inventario.repository.ProductoRepository;
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

    public MovimientoController(MovimientoRepository movRepo, ProductoRepository prodRepo) {
        this.movRepo = movRepo;
        this.prodRepo = prodRepo;
    }

    @GetMapping
    public List<Movimiento> listar() {
        return movRepo.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrar(@RequestBody Movimiento mov) {
        Optional<Producto> prodOpt = prodRepo.findById(mov.getIdProducto());
        if (prodOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado");
        }

        Producto p = prodOpt.get();

        if ("ENTRADA".equalsIgnoreCase(mov.getTipo())) {
            p.setStock(p.getStock() + mov.getCantidad());
        } else if ("SALIDA".equalsIgnoreCase(mov.getTipo())) {
            if (p.getStock() < mov.getCantidad()) {
                return ResponseEntity.badRequest().body("Stock insuficiente para realizar la salida");
            }
            p.setStock(p.getStock() - mov.getCantidad());
        } else {
            return ResponseEntity.badRequest().body("Tipo inválido. Debe ser ENTRADA o SALIDA");
        }

        prodRepo.save(p);
        Movimiento guardado = movRepo.save(mov);
        return ResponseEntity.ok(guardado);
    }
}