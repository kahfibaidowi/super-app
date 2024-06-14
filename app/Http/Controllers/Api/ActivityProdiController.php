<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\ActivityProdiModel;
use App\Repository\ActivityProdiRepo;

class ActivityProdiController extends Controller
{
    
    /**
     * tambah activity prodi
     * 
     * @authenticated
     * @group Activity Prodi
     */
    public function add(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'file_tor_rab'  =>"required",
            'file_tor'  =>"present",
            'file_rab'  =>"present",
            'iku'       =>"required",
            'ik'        =>"required",
            'program'   =>"required",
            'judul_kegiatan'=>"required",
            'penanggung_jawab_kegiatan'  =>"required",
            'data'      =>"present|array"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            ActivityProdiModel::create([
                'file_tor_rab'  =>$req['file_tor_rab'],
                'file_tor'  =>$req['file_tor'],
                'file_rab'  =>$req['file_rab'],
                'iku'       =>$req['iku'],
                'ik'        =>$req['ik'],
                'program'   =>$req['program'],
                'judul_kegiatan'=>$req['judul_kegiatan'],
                'penanggung_jawab_kegiatan'  =>$req['penanggung_jawab_kegiatan'],
                'data'      =>$req['data']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update activity prodi
     *
     * @authenticated
     * @bodyParam id_activity_prodi diambil dari id(abaikan ini). No-example
     * @group Activity Prodi
     */
    public function update(Request $request, $id)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $req['id_activity_prodi']=$id;
        $validation=Validator::make($req, [
            'id_activity_prodi' =>[
                "required",
                Rule::exists("App\Models\ActivityProdiModel")
            ],
            'file_tor_rab'  =>"required",
            'file_tor'  =>"present",
            'file_rab'  =>"present",
            'iku'       =>"required",
            'ik'        =>"required",
            'program'   =>"required",
            'judul_kegiatan'=>"required",
            'penanggung_jawab_kegiatan'  =>"required",
            'data'      =>"present|array"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            $data_update=[
                'file_tor_rab'  =>$req['file_tor_rab'],
                'file_tor'  =>$req['file_tor'],
                'file_rab'  =>$req['file_rab'],
                'iku'       =>$req['iku'],
                'ik'        =>$req['ik'],
                'program'   =>$req['program'],
                'judul_kegiatan'=>$req['judul_kegiatan'],
                'penanggung_jawab_kegiatan'  =>$req['penanggung_jawab_kegiatan'],
                'data'      =>$req['data']
            ];

            ActivityProdiModel::where("id_activity_prodi", $req['id_activity_prodi'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus activity prodi
     *
     * @authenticated
     * @bodyParam id_activity_prodi diambil dari id(abaikan ini). No-example
     * @group Activity Prodi
     */
    public function delete(Request $request, $id)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $req['id_activity_prodi']=$id;
        $validation=Validator::make($req, [
            'id_activity_prodi'   =>[
                "required",
                Rule::exists("App\Models\ActivityProdiModel")
            ],
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            ActivityProdiModel::where("id_activity_prodi", $req['id_activity_prodi'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list activity prodi
     *
     * @authenticated
     * @group Activity Prodi
     */
    public function gets(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'q'             =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $activity_prodi=ActivityProdiRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$activity_prodi['current_page'],
            'last_page'     =>$activity_prodi['last_page'],
            'total'         =>$activity_prodi['total'],
            'data'          =>$activity_prodi['data']
        ]);
    }
}
