document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contraseña = document.getElementById('contraseña').value;

    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, correo, contraseña })
        });

        if (response.ok) {
            alert('Registro exitoso');
        } else {
            const error = await response.text();
            alert('Error en el registro: ' + error);
        }
    } catch (error) {
        alert('Error en el registro: ' + error.message);
    }
});
