<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Intervention\Image\ImageManagerStatic as Image;
use App\Http\Controllers\Controller;

class FileController extends Controller
{

    /**
     * upload dokumen
     *
     * @authenticated
     * @group File Manager
     */
    public function upload(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //VALIDATION
        $validation=Validator::make($req, [
            'dokumen'   =>"required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 500);
        }

        //SUCCESS
        $name=preg_replace("/\s+/", '', $request->file("dokumen")->getClientOriginalName());
        $file=$login_data['id_user']."__".date("YmdHis")."__".$name;
        $file_name=$request->file("dokumen")->getClientOriginalName();
        $file_size=$request->file("dokumen")->getSize();

        //upload
        $request->file("dokumen")->move(storage_path(env("UPLOAD_PATH")), $file);

        return response()->json([
            'data'  =>[
                'file'      =>$file,
                'file_name' =>$file_name,
                'size'      =>$file_size/1000,
                'created_at'=>\Carbon\Carbon::parse(date("Y-m-d H:i:s"))->timezone(env("APP_TIMEZONE"))
            ]
        ]);
    }

    /**
     * upload avatar
     *
     * @authenticated
     * @group File Manager
     */
    public function upload_avatar(Request $request)
    {
        $login_data=$request->user();
        $req=$request->all();

        //VALIDATION
        $validation=Validator::make($req, [
            'image'   =>"required|file|max:10240|mimes:jpg,jpeg,png"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 500);
        }

        //SUCCESS
        $file=$login_data['id_user']."__".date("YmdHis")."__".preg_replace("/\s+/", "-", $request->file("image")->getClientOriginalName());
        $file_name=$request->file("image")->getClientOriginalName();

        //upload
        Image::make($request->file("image")->path())->fit(150)->save(storage_path(env("UPLOAD_PATH"))."/".$file);
        $file_size=strlen(file_get_contents(storage_path(env("UPLOAD_PATH"))."/".$file));

        return response()->json([
            'data'  =>[
                'file'      =>$file,
                'file_name' =>$file_name,
                'size'      =>$file_size/1000,
                'created_at'=>\Carbon\Carbon::parse(date("Y-m-d H:i:s"))->timezone(env("APP_TIMEZONE"))
            ]
        ]);
    }
}