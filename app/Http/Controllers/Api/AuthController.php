<?php

namespace App\Http\Controllers\Api;

use Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserModel;

class AuthController extends Controller
{

    /**
     * login
     *
     * @group Authentikasi
     */
    public function login(Request $request)
    {
        $req=$request->all();

        //VALIDATION
        $validation=Validator::make($req, [
            'username'  =>"required",
            'password'  =>"required",
            'remember'  =>"required|boolean"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //AUTH
        $user=UserModel::where("username", $req['username'])->first();
        if(is_null($user)){
            return response('Unauthorized.', 401);
        }
        if(!Hash::check($req['password'], $user['password'])){
            return response('Unauthorized.', 401);
        }

        //SUCCESS
        //--no_remember=1 jam, remember=1 hari
        $expired=!$req['remember']?60:24*60;
        $token=$user->createToken("auth_token", ["*"], now()->addSeconds($expired*60))->plainTextToken;
        
        return response()->json([
            'data'  =>array_merge($user->toArray(), [
                'access_token'  =>$token,
                'expired'       =>$expired*60
            ])
        ]);
    }

    /**
     * profile
     *
     * @authenticated
     * @group Authentikasi
     */
    public function profile()
    {
        return response()->json([
            'data'  =>auth()->user()
        ]);
    }

    /**
     * logout
     *
     * @authenticated
     * @group Authentikasi
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response('Unauthorized.', 401);
    }
}
