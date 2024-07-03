<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\KontakModel;
use App\Models\KontakGroupModel;
use App\Models\KontakGroupDetailModel;
use App\Repository\KontakRepo;

class KontakGroupController extends Controller
{
    
    /**
     * tambah kontak group
     * 
     * @authenticated
     * @group Kontak Group
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
            'nama_group'    =>"required",
            'kontak'        =>"present|array|min:0",
            'kontak.*.no_hp'=>"required|numeric",
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
            //group
            $group=KontakGroupModel::create([
                'nama_group'    =>$req['nama_group']
            ]);

            //kontak
            $kontak_id=[];
            foreach($req['kontak'] as $val){
                $kontak=KontakModel::updateOrCreate(
                    [
                        'no_hp'         =>$val['no_hp']
                    ],
                    [
                        'nama_lengkap'  =>$val['nama_lengkap']
                    ]
                );
                $kontak_id[]=$kontak['id_kontak'];
            }

            //group detail
            foreach($kontak_id as $val){
                KontakGroupDetailModel::create([
                    'id_group'      =>$group['id_group'],
                    'id_kontak'     =>$val
                ]);
            }
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update kontak group
     *
     * @authenticated
     * @bodyParam id_group diambil dari id(abaikan ini). No-example
     * @group Kontak Group
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
        $req['id_group']=$id;
        $validation=Validator::make($req, [
            'id_group'   =>[
                "required",
                Rule::exists("App\Models\KontakGroupModel")
            ],
            'nama_group'        =>"required",
            'kontak'            =>"present|array|min:0",
            'kontak.*.no_hp'    =>"required|numeric",
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
            $group=KontakGroupModel::where("id_group", $req['id_group'])->lockForUpdate()->first();

            $detail=KontakGroupDetailModel::with("kontak:id_kontak,no_hp")->where("id_group", $req['id_group'])->get();

            //group detail deleted
            $deleted_detail=[];
            foreach($detail as $val){
                $found=false;
                foreach($req['kontak'] as $wa){
                    if($val['kontak']['no_hp']==$wa['no_hp']){
                        $found=true;
                        break;
                    }
                }

                if(!$found){
                    KontakGroupDetailModel::where("id_detail", $val['id_detail'])->delete();
                }
            }
            
            //kontak
            $kontak_id=[];
            foreach($req['kontak'] as $val){
                $kontak=KontakModel::updateOrCreate(
                    [
                        'no_hp'         =>$val['no_hp']
                    ],
                    [
                        'nama_lengkap'  =>$val['nama_lengkap']
                    ]
                );
                $kontak_id[]=$kontak['id_kontak'];
            }

            //group detail
            foreach($kontak_id as $val){
                KontakGroupDetailModel::updateOrCreate([
                    'id_group'   =>$req['id_group'],
                    'id_kontak'         =>$val
                ]);
            }

            //group
            $data_update=[
                'nama_group'    =>$req['nama_group']
            ];
            $group->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus kontak group
     *
     * @authenticated
     * @bodyParam id_group diambil dari id(abaikan ini). No-example
     * @group Kontak Group
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
        $req['id_group']=$id;
        $validation=Validator::make($req, [
            'id_group'   =>[
                "required",
                Rule::exists("App\Models\KontakGroupModel")
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
            KontakGroupModel::where("id_group", $req['id_group'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list kontak group
     *
     * @authenticated
     * @group Kontak Group
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
        $kontak=KontakRepo::gets_group($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$kontak['current_page'],
            'last_page'     =>$kontak['last_page'],
            'total'         =>$kontak['total'],
            'data'          =>$kontak['data']
        ]);
    }
}
