<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PpeppKriteriaController extends Controller
{
    
    public function index()
    {
        return Inertia::render("Admin/PpeppKriteria/Index");
    }
}
