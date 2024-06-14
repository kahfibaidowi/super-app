<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserModel;

class AuthController extends Controller
{
    public function index()
    {
        return Inertia::render("Login");
    }

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
            return back()->withErrors([
                'type'      =>"validation_error",
                'message'   =>$validation->errors()->first()
            ]);
        }

        //AUTH
        $user=Auth::attempt(
            [
                'username'  =>$req['username'],
                'password'  =>$req['password'],
                'status'    =>"active"
            ], 
            $req['remember']
        );
        if(!$user){
            return back()->withErrors([
                'message'   =>"Login Gagal.!",
                'type'      =>"auth_fail"
            ]);
        }

        //SUCCESS
        $request->session()->regenerate();
        return redirect("/admin");
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect("/");
    }
}
