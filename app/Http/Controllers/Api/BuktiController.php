<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\BuktiModel;
use App\Repository\BuktiRepo;

class BuktiController extends Controller
{
    
    /**
     * tambah bukti
     * 
     * @authenticated
     * @group Bukti
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
            'type'          =>"required|in:penetapan,pelaksanaan,evaluasi,pengendalian",
            'id_ppepp'      =>"required|exists:App\Models\PpeppModel",
            'deskripsi'     =>"present",
            'file'          =>"required",
            'link'          =>"required"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            BuktiModel::create([
                'type'      =>$req['type'],
                'id_ppepp'  =>$req['id_ppepp'],
                'deskripsi' =>$req['deskripsi'],
                'file'      =>$req['file'],
                'link'      =>$req['link']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update bukti
     *
     * @authenticated
     * @bodyParam id_bukti diambil dari id(abaikan ini). No-example
     * @group Bukti
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
        $req['id_bukti']=$id;
        $validation=Validator::make($req, [
            'id_bukti' =>[
                "required",
                Rule::exists("App\Models\BuktiModel")
            ],
            'deskripsi'     =>"present"
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
                'deskripsi'     =>$req['deskripsi']
            ];

            BuktiModel::where("id_bukti", $req['id_bukti'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus bukti
     *
     * @authenticated
     * @bodyParam id_bukti diambil dari id(abaikan ini). No-example
     * @group Bukti
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
        $req['id_bukti']=$id;
        $validation=Validator::make($req, [
            'id_bukti'   =>[
                "required",
                Rule::exists("App\Models\BuktiModel")
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
            BuktiModel::where("id_bukti", $req['id_bukti'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list bukti
     *
     * @authenticated
     * @group Bukti
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
            'q'             =>"nullable",
            'type'          =>"nullable|in:penetapan,pelaksanaan,evaluasi,pengendalian",
            'id_ppepp'      =>"nullable",
            'id_kriteria'   =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $bukti=BuktiRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$bukti['current_page'],
            'last_page'     =>$bukti['last_page'],
            'total'         =>$bukti['total'],
            'data'          =>$bukti['data']
        ]);
    }
}
