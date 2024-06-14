<!DOCTYPE html>
<html 
    lang="en"
    data-bs-theme="light"
    data-menu-color="dark"
    data-topbar-color="light"
    data-layout-position="scrollable"
    data-sidenav-size="default"
>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
