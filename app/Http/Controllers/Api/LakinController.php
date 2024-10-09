<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\LakinModel;
use App\Repository\LakinRepo;

class LakinController extends Controller
{
    
    /**
     * upsert lakin
     * 
     * @authenticated
     * @group Lakin
     */
    public function upsert(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        if(!in_array($login_data['role'], ['admin', 'pengawal'])){
            return response('Not Allowed.', 403);
        }

        //VALIDATION
        $validation=Validator::make($req, [
            'type'      =>"required",
            'content'   =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            LakinModel::updateOrCreate(
                [
                    'type'      =>$req['type']
                ],
                [
                    'content'   =>$req['content']
                ]
            );
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus lakin
     *
     * @authenticated
     * @bodyParam id_lakin diambil dari id(abaikan ini). No-example
     * @group Lakin
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
        $req['id_lakin']=$id;
        $validation=Validator::make($req, [
            'id_lakin'   =>[
                "required",
                Rule::exists("App\Models\LakinModel")
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
            LakinModel::where("id_lakin", $req['id_lakin'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * get lakin
     *
     * @authenticated
     * @group Lakin
     */
    public function get(Request $request)
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
            'type'      =>"required"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $lakin=LakinRepo::get_by_type($req['type']);

        return response()->json([
            'data'          =>$lakin
        ]);
    }
}
