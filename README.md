# PC2-SistemaBD2

## Ejecutar el programa

Se necesita Java 21 y conexión a internet para que el backend se conecte a
Supabase. En PowerShell, desde la carpeta raíz del repositorio, ejecuta:

```powershell
cd backend
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME = "postgres.tseqesbgszklimwiilpr"
$secure = Read-Host "BDinventario" -AsSecureString
$env:SPRING_DATASOURCE_PASSWORD = [System.Net.NetworkCredential]::new("", $secure).Password
.\mvnw.cmd spring-boot:run
```
luego al ejecutar esos comandos conjuntamente,
te saldra 
BDinventario:
Solos vuelve a repetir la contraseña BDinventario, para ingresar


Escribe la contraseña de la base de datos cuando PowerShell la solicite. No se
mostrará en pantalla. Mantén esta ventana abierta mientras uses la aplicación;
las variables de entorno solo duran durante esa sesión de PowerShell. Para
detener el servidor, presiona `Ctrl+C`.

Con el backend iniciado, abre [http://localhost:8080/](http://localhost:8080/).
El panel web y la API se sirven desde el mismo servidor.

