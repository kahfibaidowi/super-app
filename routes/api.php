<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\ActivityProdiController;
use App\Http\Controllers\Api\PpeppKriteriaController;
use App\Http\Controllers\Api\PpeppController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/auth/login', [AuthController::class, 'login']);
Route::controller(AuthController::class)->prefix("/auth")->middleware("auth:sanctum")->group(function(){
    Route::get('/profile', 'profile');
    Route::delete('/logout', 'logout');
});

Route::controller(FileController::class)->prefix("/file")->middleware("auth:sanctum")->group(function(){
    Route::post("/upload", "upload");
    Route::post("/upload_avatar", "upload_avatar");
});

Route::controller(UserController::class)->prefix("/user")->middleware("auth:sanctum")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
});

Route::controller(ActivityProdiController::class)->prefix("/activity_prodi")->middleware("auth:sanctum")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
});

Route::controller(PpeppKriteriaController::class)->prefix("/ppepp_kriteria")->middleware("auth:sanctum")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
});

Route::controller(PpeppController::class)->prefix("/ppepp")->middleware("auth:sanctum")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
});