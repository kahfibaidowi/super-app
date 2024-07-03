<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\KontakModel;
use App\Repository\KontakRepo;

class KontakController extends Controller
{
    
    /**
     * tambah kontak
     * 
     * @authenticated
     * @group Kontak
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
            'no_hp'         =>"required|numeric",
            'nama_lengkap'  =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            KontakModel::create([
                'no_hp'         =>$req['no_hp'],
                'nama_lengkap'  =>$req['nama_lengkap']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * tambah kontak multiple
     * 
     * @authenticated
     * @group Kontak
     */
    public function upsert_multiple(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'kontak'    =>"present|array|min:0",
            'kontak.*.no_hp'        =>"required|numeric",
            'kontak.*.nama_lengkap' =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            $q=KontakModel::lockForUpdate()->first();

            foreach($req['kontak'] as $val){
                KontakModel::updateOrCreate(
                    [
                        'no_hp'         =>$val['no_hp']
                    ],
                    [
                        'nama_lengkap'  =>$val['nama_lengkap']
                    ]
                );
            }
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update kontak
     *
     * @authenticated
     * @bodyParam id_kontak diambil dari id(abaikan ini). No-example
     * @group Kontak
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
        $req['id_kontak']=$id;
        $validation=Validator::make($req, [
            'id_kontak' =>[
                "required",
                Rule::exists("App\Models\KontakModel")
            ],
            'nama_lengkap'  =>"present"
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
                'nama_lengkap'  =>$req['nama_lengkap']
            ];

            KontakModel::where("id_kontak", $req['id_kontak'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus kontak
     *
     * @authenticated
     * @bodyParam id_kontak diambil dari id(abaikan ini). No-example
     * @group Kontak
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
        $req['id_kontak']=$id;
        $validation=Validator::make($req, [
            'id_kontak'   =>[
                "required",
                Rule::exists("App\Models\KontakModel")
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
            KontakModel::where("id_kontak", $req['id_kontak'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list kontak
     *
     * @authenticated
     * @group Kontak
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
        $kontak=KontakRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$kontak['current_page'],
            'last_page'     =>$kontak['last_page'],
            'total'         =>$kontak['total'],
            'data'          =>$kontak['data']
        ]);
    }
}
