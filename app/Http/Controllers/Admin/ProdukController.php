<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    
    public function index()
    {
        return Inertia::render("Admin/Produk/Index");
    }

    public function add()
    {
        return Inertia::render("Admin/Produk/Add");
    }
    
    public function edit(Request $request, $id)
    {
        return Inertia::render("Admin/Produk/Edit", [
            'id_produk' =>$id
        ]);
    }
}
