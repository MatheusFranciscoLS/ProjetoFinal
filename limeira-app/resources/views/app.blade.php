<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="Integração do React com Laravel para aplicações web dinâmicas.">
    <meta name="author" content="Seu Nome ou Empresa">
    <title>React com Laravel</title>

    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon">

    <!-- Importando o Vite para o React -->
    @vite('resources/js/app.jsx')
    <div>
        <h1>Bem-vindo ao React com Laravel!</h1>
    </div>

    <!-- Estilos Inline para evitar FOUC -->
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <!-- O React vai renderizar a interface dentro desse elemento -->
    <div id="root"></div>

    <!-- Scripts carregados no final do body -->
</body>
</html>
