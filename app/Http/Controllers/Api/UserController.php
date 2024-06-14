<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\UserModel;
use App\Repository\UserRepo;

class UserController extends Controller
{
    
    /**
     * tambah user
     *
     * @authenticated
     * @group Users
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
            'username'  =>"required|unique:App\Models\UserModel,username",
            'email'     =>"required|email|unique:App\Models\UserModel,email",
            'password'  =>"required",
            'role'      =>"required|in:admin",
            'nama_lengkap'  =>"required",
            'avatar_url'=>"present",
            'status'    =>"required|in:active,suspend"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            UserModel::create([
                'username'      =>$req['username'],
                'email'         =>$req['email'],
                'role'          =>$req['role'],
                'nama_lengkap'  =>$req['nama_lengkap'],
                'password'      =>Hash::make($req['password']),
                'avatar_url'    =>$req['avatar_url'],
                'status'        =>$req['status']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update user
     *
     * @authenticated
     * @bodyParam id_user diambil dari id(abaikan ini). No-example
     * @group Users
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
        $req['id_user']=$id;
        $validation=Validator::make($req, [
            'id_user'   =>"required|exists:App\Models\UserModel,id_user",
            'username'  =>[
                "required",
                Rule::unique("App\Models\UserModel")->where(function($query)use($req){
                    return $query->where("id_user", "!=", $req['id_user']);
                })
            ],
            'email'     =>[
                "required",
                "email",
                Rule::unique("App\Models\UserModel")->where(function($query)use($req){
                    return $query->where("id_user", "!=", $req['id_user']);
                })
            ],
            'password'      =>[
                Rule::requiredIf(!isset($req['password']))
            ],
            'nama_lengkap'  =>"required",
            'avatar_url'=>[
                Rule::requiredIf(!isset($req['avatar_url']))
            ],
            'status'    =>"required|in:active,suspend"
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
                'username'      =>$req['username'],
                'email'         =>$req['email'],
                'nama_lengkap'  =>$req['nama_lengkap'],
                'avatar_url'    =>$req['avatar_url'],
                'status'        =>$req['status']
            ];
            if(trim($req['password'])!=""){
                $data_update['password']=Hash::make($req['password']);
            }

            UserModel::where("id_user", $req['id_user'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus user
     *
     * @authenticated
     * @bodyParam id_user diambil dari id(abaikan ini). No-example
     * @group Users
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
        $req['id_user']=$id;
        $validation=Validator::make($req, [
            'id_user'   =>[
                "required",
                Rule::exists("App\Models\UserModel")
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
            UserModel::where("id_user", $req['id_user'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list user
     *
     * @authenticated
     * @group Users
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
            'per_page'  =>"nullable|integer|min:1",
            'q'         =>"nullable",
            'role'      =>"nullable",
            'status'    =>"nullable|in:active,suspend"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $user=UserRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$user['current_page'],
            'last_page'     =>$user['last_page'],
            'total'         =>$user['total'],
            'data'          =>$user['data']
        ]);
    }
}
