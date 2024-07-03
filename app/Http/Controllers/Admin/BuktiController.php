<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuktiController extends Controller
{
    
    public function index(Request $request, $id)
    {
        return Inertia::render("Admin/Bukti/Index", [
            'id_kriteria'   =>$id
        ]);
    }
}
