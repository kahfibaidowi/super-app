<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Repository\LakinRepo;

class LakinController extends Controller
{
    
    public function penyusunan(Request $request)
    {
        return Inertia::render("Admin/Lakin/Penyusunan");
    }

    public function jumlah_camaba(Request $request)
    {
        return Inertia::render("Admin/Lakin/JumlahCamaba");
    }

    public function avg_dtpr(Request $request)
    {
        return Inertia::render("Admin/Lakin/AvgDTPR");
    }

    public function tenaga_kependidikan(Request $request)
    {
        return Inertia::render("Admin/Lakin/TenagaKependidikan");
    }

    public function sumber_pendanaan_ps(Request $request)
    {
        return Inertia::render("Admin/Lakin/SumberPendanaanPS");
    }

    public function aksesibilitas_data_sistem_informasi(Request $request)
    {
        return Inertia::render("Admin/Lakin/AksesibilitasDataSistemInformasi");
    }

    public function pendayagunaan_sarana_prasarana_utama(Request $request)
    {
        return Inertia::render("Admin/Lakin/PendayagunaanSaranaPrasaranaUtama");
    }

    public function ipk_lulusan(Request $request)
    {
        return Inertia::render("Admin/Lakin/IPKLulusan");
    }
    
    public function kelulusan_tepat_waktu(Request $request)
    {
        return Inertia::render("Admin/Lakin/KelulusanTepatWaktu");
    }
    
    public function avg_masa_tunggu_lulusan_bekerja(Request $request)
    {
        return Inertia::render("Admin/Lakin/AvgMasaTungguLulusanBekerja");
    }
    
    public function kesesuaian_bidang_kerja_lulusan(Request $request)
    {
        return Inertia::render("Admin/Lakin/KesesuaianBidangKerjaLulusan");
    }
    
    public function penelitian_kegiatan_pengabdian_masyarakat(Request $request)
    {
        return Inertia::render("Admin/Lakin/PenelitianKegiatanPengabdianMasyarakat");
    }

    public function print_lakin(Request $request)
    {

        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'type'  =>"required",
            'tahun' =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $lakin=LakinRepo::get_by_type($req['type']);

        Inertia::setRootView("print");

        $page="";
        switch($req['type']){
            case "jumlah_camaba":
                $page="Admin/Lakin/JumlahCamabaPrint";
            break;
            case "avg_dtpr":
                $page="Admin/Lakin/AvgDTPRPrint";
            break;
            case "tenaga_kependidikan":
                $page="Admin/Lakin/TenagaKependidikanPrint";
            break;
            case "sumber_pendanaan_ps":
                $page="Admin/Lakin/SumberPendanaanPSPrint";
            break;
            case "aksesibilitas_data_sistem_informasi":
                $page="Admin/Lakin/AksesibilitasDataSistemInformasiPrint";
            break;
            case "pendayagunaan_sarana_prasarana_utama":
                $page="Admin/Lakin/PendayagunaanSaranaPrasaranaUtamaPrint";
            break;
            case "ipk_lulusan":
                $page="Admin/Lakin/IPKLulusanPrint";
            break;
            case "kelulusan_tepat_waktu":
                $page="Admin/Lakin/KelulusanTepatWaktuPrint";
            break;
            case "avg_masa_tunggu_lulusan_bekerja":
                $page="Admin/Lakin/AvgMasaTungguLulusanBekerjaPrint";
            break;
            case "kesesuaian_bidang_kerja_lulusan":
                $page="Admin/Lakin/KesesuaianBidangKerjaLulusanPrint";
            break;
            case "penelitian_kegiatan_pengabdian_masyarakat":
                $page="Admin/Lakin/PenelitianKegiatanPengabdianMasyarakatPrint";
            break;
            case "penyusunan":
                $page="Admin/Lakin/PenyusunanPrint";
            break;
        }

        return Inertia::render($page, [
            'data'      =>$lakin['data'],
            'detail'    =>isset($lakin['detail'])?$lakin['detail']:null,
            'tahun'     =>isset($req['tahun'])?trim($req['tahun']):""
        ]);
    }
}
