<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PpeppController extends Controller
{
    
    public function index()
    {
        return Inertia::render("Admin/Ppepp/Index");
    }

    public function sub()
    {
        return Inertia::render("Admin/Ppepp/SubPpepp");
    }

    public function rekap_sub(Request $request)
    {
        return Inertia::render("Admin/Ppepp/RekapSubPpepp");
    }
}
