<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ActivityProdiController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware("guest")->get('/', [AuthController::class, 'index'])->name("login");
Route::post('/login', [AuthController::class, 'login']);

Route::middleware("auth")->delete('/logout', [AuthController::class, 'logout']);
Route::middleware("auth")->get('/admin', [DashboardController::class, 'index']);

Route::controller(UserController::class)->prefix("/admin/users")->middleware("auth")->group(function(){
    Route::get("/", "index");
});

Route::controller(ActivityProdiController::class)->prefix("/admin/activity_prodi")->middleware("auth")->group(function(){
    Route::get("/", "index");
});