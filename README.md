# PC2-SistemaBD2
Sistema con base de datos distribuida

## Frontend de inventario

El panel web está integrado en los recursos estáticos de Spring Boot. Inicia el
backend y abre `http://localhost:8080/` para consultar productos y movimientos,
registrar productos y crear entradas o salidas de stock.

El frontend consume los endpoints existentes:

- `GET` y `POST /api/productos`
- `GET` y `POST /api/movimientos`

Al registrar un movimiento, el backend actualiza el stock del producto. El
formulario de productos admite `idCategoria`, que debe corresponder a una
categoría existente en la base de datos. El backend actual aún no expone una API
para listar o administrar categorías ni usuarios.
