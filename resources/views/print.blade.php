<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        <style>
            body{
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: center;
            }
            #table-container,
            #table-title{
                width: 1200px;
            }
            #app{
                display: flex;
                flex-direction: column;
                align-items: center
            }
            @media print {
                body{
                    -webkit-print-color-adjust:exact !important;
                    print-color-adjust:exact !important;
                }
                #app{
                    width: 100% !important;
                }
                #table-container,
                #table-title{
                    display: block;
                    width: 100% !important;
                }
                #doc-title{
                    display: block;
                }
                #table{
                    width: 100% !important;
                }
                div.block-print{
                    display:block;
                    break-inside: avoid !important;
                    float: left;
                }
            }
        </style>
    </head>
    <body style="background:#fff;padding:0">
        @inertia
    </body>
</html>
