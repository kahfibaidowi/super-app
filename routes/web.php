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
use App\Http\Controllers\Admin\PpeppKriteriaController;
use App\Http\Controllers\Admin\PpeppController;
use App\Http\Controllers\Admin\BuktiController;
use App\Http\Controllers\Admin\PesanWhatsappController;
use App\Http\Controllers\Admin\KontakController;
use App\Http\Controllers\Admin\KontakGroupController;
use App\Http\Controllers\Admin\LakinController;

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

Route::controller(PpeppKriteriaController::class)->prefix("/admin/ppepp_kriteria")->middleware("auth")->group(function(){
    Route::get("/", "index");
});

Route::controller(PpeppController::class)->prefix("/admin/ppepp")->middleware("auth")->group(function(){
    Route::get("/", "index");
    Route::get("/sub", "sub");
    Route::get("/type/rekap_sub", "rekap_sub");
});

Route::controller(BuktiController::class)->prefix("/admin/bukti")->middleware("auth")->group(function(){
    Route::get("/{id}", "index");
    Route::get("/type/rekap_bukti", "rekap_bukti");
});

Route::controller(PesanWhatsappController::class)->prefix("/admin/pesan_whatsapp")->middleware("auth")->group(function(){
    Route::get("/", "index");
});

Route::controller(KontakController::class)->prefix("/admin/kontak")->middleware("auth")->group(function(){
    Route::get("/", "index");
});

Route::controller(KontakGroupController::class)->prefix("/admin/kontak_group")->middleware("auth")->group(function(){
    Route::get("/", "index");
});

Route::controller(LakinController::class)->prefix("/admin/lakin")->middleware("auth")->group(function(){
    Route::get("/type/penyusunan", "penyusunan");
    Route::get("/type/jumlah_camaba", "jumlah_camaba");
    Route::get("/type/avg_dtpr", "avg_dtpr");
    Route::get("/type/tenaga_kependidikan", "tenaga_kependidikan");
    Route::get("/type/sumber_pendanaan_ps", "sumber_pendanaan_ps");
    Route::get("/type/aksesibilitas_data_sistem_informasi", "aksesibilitas_data_sistem_informasi");
    Route::get("/type/pendayagunaan_sarana_prasarana_utama", "pendayagunaan_sarana_prasarana_utama");
    Route::get("/type/ipk_lulusan", "ipk_lulusan");
    Route::get("/type/kelulusan_tepat_waktu", "kelulusan_tepat_waktu");
    Route::get("/type/avg_masa_tunggu_lulusan_bekerja", "avg_masa_tunggu_lulusan_bekerja");
    Route::get("/type/kesesuaian_bidang_kerja_lulusan", "kesesuaian_bidang_kerja_lulusan");
    Route::get("/type/penelitian_kegiatan_pengabdian_masyarakat", "penelitian_kegiatan_pengabdian_masyarakat");
    Route::get("/print", "print_lakin");
});