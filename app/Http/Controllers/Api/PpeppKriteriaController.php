<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\PpeppKriteriaModel;
use App\Repository\PpeppKriteriaRepo;

class PpeppKriteriaController extends Controller
{
    
    /**
     * tambah kriteria
     * 
     * @authenticated
     * @group PPEPP Kriteria
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
            'nama_kriteria' =>"required"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            PpeppKriteriaModel::create([
                'nama_kriteria' =>$req['nama_kriteria']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update kriteria
     *
     * @authenticated
     * @bodyParam id_kriteria diambil dari id(abaikan ini). No-example
     * @group PPEPP Kriteria
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
        $req['id_kriteria']=$id;
        $validation=Validator::make($req, [
            'id_kriteria' =>[
                "required",
                Rule::exists("App\Models\PpeppKriteriaModel")
            ],
            'nama_kriteria'     =>"required"
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
                'nama_kriteria' =>$req['nama_kriteria']
            ];

            PpeppKriteriaModel::where("id_kriteria", $req['id_kriteria'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus kriteria
     *
     * @authenticated
     * @bodyParam id_kriteria diambil dari id(abaikan ini). No-example
     * @group PPEPP Kriteria
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
        $req['id_kriteria']=$id;
        $validation=Validator::make($req, [
            'id_kriteria'   =>[
                "required",
                Rule::exists("App\Models\PpeppKriteriaModel")
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
            PpeppKriteriaModel::where("id_kriteria", $req['id_kriteria'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list kriteria
     *
     * @authenticated
     * @group PPEPP Kriteria
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
        $kriteria=PpeppKriteriaRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$kriteria['current_page'],
            'last_page'     =>$kriteria['last_page'],
            'total'         =>$kriteria['total'],
            'data'          =>$kriteria['data']
        ]);
    }
}
