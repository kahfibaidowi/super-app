<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\PpeppModel;
use App\Repository\PpeppRepo;

class PpeppController extends Controller
{
    
    /**
     * tambah ppepp
     * 
     * @authenticated
     * @group PPEPP
     */
    public function add(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pengawal'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'type'          =>"required|in:ppepp,sub_ppepp",
            'id_kriteria'   =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['id_kriteria'])) return true;
                    if($req['type']=="ppepp") return true;
                    return false;
                })
            ],
            'nested'        =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['nested'])) return true;
                    if($req['type']=="sub_ppepp") return true;
                    return false;
                }),
                Rule::exists("App\Models\PpeppModel", "id_ppepp")->where(function($q){
                    $q->whereNull("nested");
                })
            ],
            'no_butir'      =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['no_butir'])) return true;
                    if($req['type']=="ppepp") return true;
                    return false;
                }),
            ],
            'no_urut'       =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['no_urut'])) return true;
                    if($req['type']=="sub_ppepp") return true;
                    return false;
                }),
            ],
            'nama_ppepp'    =>"required",
            'deskripsi'     =>"present",
            'standar_minimum'=>"present",
            'bobot'         =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['bobot'])) return true;
                    if($req['type']=="sub_ppepp") return true;
                    return false;
                }),
                "numeric",
                "min:0"
            ],
            'skor'          =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['skor'])) return true;
                    if($req['type']=="sub_ppepp") return true;
                    return false;
                }),
                "numeric",
                "min:0"
            ]
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            PpeppModel::create([
                'id_kriteria'   =>trim($req['id_kriteria'])!=""?$req['id_kriteria']:null,
                'nested'        =>trim($req['nested'])!=""?$req['nested']:null,
                'no_butir'      =>$req['no_butir'],
                'no_urut'       =>$req['no_urut'],
                'nama_ppepp'    =>$req['nama_ppepp'],
                'deskripsi'     =>$req['deskripsi'],
                'standar_minimum'=>$req['standar_minimum'],
                'bobot'         =>trim($req['bobot'])!=""?$req['bobot']:null,
                'skor'          =>trim($req['skor'])!=""?$req['skor']:null
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update ppepp
     *
     * @authenticated
     * @bodyParam id_ppepp diambil dari id(abaikan ini). No-example
     * @group PPEPP
     */
    public function update(Request $request, $id)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pengawal'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $req['id_ppepp']=$id;
        $validation=Validator::make($req, [
            'id_ppepp' =>[
                "required",
                Rule::exists("App\Models\PpeppModel")
            ],
            'no_butir'      =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['no_butir'])) return true;
                    
                    $q=PpeppModel::where("id_ppepp", $req['id_ppepp'])->first();
                    if(!isset($q)) return true;
                    if(is_null($q['nested'])) return true;

                    return false;
                }),
            ],
            'no_urut'       =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['no_urut'])) return true;
                    
                    $q=PpeppModel::where("id_ppepp", $req['id_ppepp'])->first();
                    if(!isset($q)) return true;
                    if(!is_null($q['nested'])) return true;

                    return false;
                }),
            ],
            'nama_ppepp'    =>"required",
            'deskripsi'     =>"present",
            'standar_minimum'=>"present",
            'bobot'         =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['bobot'])) return true;
                    
                    $q=PpeppModel::where("id_ppepp", $req['id_ppepp'])->first();
                    if(!isset($q)) return true;
                    if(!is_null($q['nested'])) return true;

                    return false;
                }),
                "numeric",
                "min:0"
            ],
            'skor'          =>[
                Rule::requiredIf(function()use($req){
                    if(!isset($req['skor'])) return true;
                    
                    $q=PpeppModel::where("id_ppepp", $req['id_ppepp'])->first();
                    if(!isset($q)) return true;
                    if(!is_null($q['nested'])) return true;

                    return false;
                }),
                "numeric",
                "min:0"
            ]
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
                'no_butir'      =>$req['no_butir'],
                'no_urut'       =>$req['no_urut'],
                'nama_ppepp'    =>$req['nama_ppepp'],
                'deskripsi'     =>$req['deskripsi'],
                'standar_minimum'=>$req['standar_minimum'],
                'bobot'         =>trim($req['bobot'])!=""?$req['bobot']:null,
                'skor'          =>trim($req['skor'])!=""?$req['skor']:null
            ];

            PpeppModel::where("id_ppepp", $req['id_ppepp'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus ppepp
     *
     * @authenticated
     * @bodyParam id_ppepp diambil dari id(abaikan ini). No-example
     * @group PPEPP
     */
    public function delete(Request $request, $id)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pengawal'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $req['id_ppepp']=$id;
        $validation=Validator::make($req, [
            'id_ppepp'   =>[
                "required",
                Rule::exists("App\Models\PpeppModel")
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
            PpeppModel::where("id_ppepp", $req['id_ppepp'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list ppepp
     *
     * @authenticated
     * @group PPEPP
     */
    public function gets(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin', 'pengawal'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'q'             =>"nullable",
            'type'          =>"nullable|in:ppepp,sub_ppepp",
            'nested'        =>"nullable",
            'id_kriteria'   =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $ppepp=PpeppRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$ppepp['current_page'],
            'last_page'     =>$ppepp['last_page'],
            'total'         =>$ppepp['total'],
            'data'          =>$ppepp['data']
        ]);
    }

    /**
     * rekap sub ppepp
     *
     * @authenticated
     * @group PPEPP
     */
    public function gets_rekap_sub_ppepp(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        //Query parameters

        //SUCCESS
        $rekap=PpeppRepo::gets_rekap_sub_ppepp();

        return response()->json([
            'data'          =>$rekap
        ]);
    }
}
