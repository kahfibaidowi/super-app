<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use App\Models\PesanWhatsappModel;
use App\Repository\PesanWhatsappRepo;

class PesanWhatsappController extends Controller
{
    
    /**
     * tambah pesan whatsapp
     * 
     * @authenticated
     * @group Pesan Whatsapp
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
            'penerima'  =>"required|array|min:1",
            'pesan'     =>"required",
            'file'      =>"present|array",
            'status'    =>"required|in:draft,sent",
            'jadwal_kirim'  =>"present|date_format:Y-m-d H:i:s",
            'data'      =>"present|array"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            PesanWhatsappModel::create([
                'penerima'  =>$req['penerima'],
                'pesan'     =>$req['pesan'],
                'file'      =>$req['file'],
                'status'    =>$req['status'],
                'jadwal_kirim'  =>trim($req['jadwal_kirim'])!=""?$req['jadwal_kirim']:null,
                'data'      =>$req['data']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * update pesan whatsapp
     *
     * @authenticated
     * @bodyParam id_pesan_whatsapp diambil dari id(abaikan ini). No-example
     * @group Pesan Whatsapp
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
        $req['id_pesan_whatsapp']=$id;
        $validation=Validator::make($req, [
            'id_pesan_whatsapp' =>[
                "required",
                Rule::exists("App\Models\PesanWhatsappModel")
            ],
            'penerima'  =>"required|array|min:1",
            'pesan'     =>"required",
            'file'      =>"present|array",
            'status'    =>"required|in:draft,sent",
            'jadwal_kirim'  =>"present|date_format:Y-m-d H:i:s",
            'data'      =>"present|array"
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
                'penerima'  =>$req['penerima'],
                'pesan'     =>$req['pesan'],
                'file'      =>$req['file'],
                'status'    =>$req['status'],
                'jadwal_kirim'  =>trim($req['jadwal_kirim'])!=""?$req['jadwal_kirim']:null,
                'data'      =>$req['data']
            ];

            PesanWhatsappModel::where("id_pesan_whatsapp", $req['id_pesan_whatsapp'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * hapus pesan whatsapp
     *
     * @authenticated
     * @bodyParam id_pesan_whatsapp diambil dari id(abaikan ini). No-example
     * @group Pesan Whatsapp
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
        $req['id_pesan_whatsapp']=$id;
        $validation=Validator::make($req, [
            'id_pesan_whatsapp'   =>[
                "required",
                Rule::exists("App\Models\PesanWhatsappModel")
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
            PesanWhatsappModel::where("id_pesan_whatsapp", $req['id_pesan_whatsapp'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    /**
     * list pesan whatsapp
     *
     * @authenticated
     * @group Pesan Whatsapp
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
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $pesan_whatsapp=PesanWhatsappRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$pesan_whatsapp['current_page'],
            'last_page'     =>$pesan_whatsapp['last_page'],
            'total'         =>$pesan_whatsapp['total'],
            'data'          =>$pesan_whatsapp['data']
        ]);
    }

    /**
     * kirim pesan whatsapp
     *
     * @authenticated
     * @bodyParam penerima array
     * @bodyParam file array
     * @group Pesan Whatsapp
     */
    public function send_message(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $validation=Validator::make($req, [
            'penerima'  =>"required|array|min:1",
            'penerima.*'=>"required|numeric",
            'pesan'     =>"required",
            'file'      =>"present|array"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $response=[];

        //text
        $text_data=[];
        foreach($req['penerima'] as $no){
            $text_data[]=[
                'phone'     =>$no,
                'message'   =>$req['pesan']
            ];
        }
        $send_text=Http::
            withHeaders([
                "Authorization" =>env("WA_API_TOKEN"),
                "Content-Type"  =>"application/json"
            ])
            ->post(env("WA_API_URL")."/send-message", [
                'data'  =>$text_data
            ]);
        $response=array_merge($response, $send_text->json()['data']['messages']);
        
        //document file
        if(count($req['file'])>0){
            $doc_data=[];
            $img_data=[];
            foreach($req['penerima'] as $no){
                foreach($req['file'] as $file){
                    $img_exts=["jpg", "jpeg", "png"];
                    
                    $exp_file=explode(".", $file['link']);
                    $ext_file=end($exp_file);
                    if(in_array($ext_file, $img_exts)){
                        $img_data[]=[
                            'phone'     =>$no,
                            'image'     =>env("APP_URL")."/storage/".$file['link'],
                            'caption'   =>$file['file']
                        ];
                    }
                    else{
                        $doc_data[]=[
                            'phone'     =>$no,
                            'document'  =>env("APP_URL")."/storage/".$file['link'],
                            'caption'   =>$file['file']
                        ];
                    }
                }
            }
            
            //--document
            if(count($doc_data)>0){
                $send_dokumen=Http::
                    withHeaders([
                        "Authorization" =>env("WA_API_TOKEN"),
                        "Content-Type"  =>"application/json"
                    ])
                    ->post(env("WA_API_URL")."/send-document", [
                        'data'  =>$doc_data
                    ]);
                $response=array_merge($response, $send_dokumen->json()['data']['messages']);
            }

            //--image
            if(count($img_data)>0){
                $send_image=Http::
                    withHeaders([
                        "Authorization" =>env("WA_API_TOKEN"),
                        "Content-Type"  =>"application/json"
                    ])
                    ->post(env("WA_API_URL")."/send-image", [
                        'data'  =>$img_data
                    ]);
                $response=array_merge($response, $send_image->json()['data']['messages']);
            }
        }
        
        //SUCCESS
        return response()->json([
            'data'  =>$response
        ]);
    }

    /**
     * kirim pesan whatsapp(schedule)
     *
     * @authenticated
     * @bodyParam penerima array
     * @bodyParam file array
     * @group Pesan Whatsapp
     */
    public function send_message_schedule(Request $request)
    {
        $login_data=$request['__data_user'];
        $req=$request->all();

        //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $validation=Validator::make($req, [
            'penerima'  =>"required|array|min:1",
            'penerima.*'=>"required|numeric",
            'pesan'     =>"required",
            'file'      =>"present|array",
            'jadwal_kirim'  =>"required|date_format:Y-m-d H:i:s"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $response=[];

        //text
        $wa_data=[];
        foreach($req['penerima'] as $no){
            $wa_data[]=[
                'category'  =>"text",
                'phone'     =>$no,
                'text'      =>$req['pesan'],
                'scheduled_at'  =>$req['jadwal_kirim']
            ];
        }
        
        //document
        if(count($req['file'])>0){
            foreach($req['penerima'] as $no){
                foreach($req['file'] as $file){
                    $img_exts=["jpg", "jpeg", "png"];
                    
                    $exp_file=explode(".", $file['link']);
                    $ext_file=end($exp_file);
                    if(in_array($ext_file, $img_exts)){
                        $wa_data[]=[
                            'category'  =>"image",
                            'phone'     =>$no,
                            'url'       =>env("APP_URL")."/storage/".$file['link'],
                            'text'      =>$file['file'],
                            'scheduled_at'  =>$req['jadwal_kirim']
                        ];
                    }
                    else{
                        $wa_data[]=[
                            'category'  =>"document",
                            'phone'     =>$no,
                            'url'       =>env("APP_URL")."/storage/".$file['link'],
                            'text'      =>$file['file'],
                            'scheduled_at'  =>$req['jadwal_kirim']
                        ];
                    }
                }
            }
        }

        //send
        $send_schedule=Http::
            withHeaders([
                "Authorization" =>env("WA_API_TOKEN"),
                "Content-Type"  =>"application/json"
            ])
            ->post(env("WA_API_URL")."/schedule", [
                'data'  =>$wa_data
            ]);
        $response=array_merge($response, $send_schedule->json()['data']['messages']);
        
        //SUCCESS
        return response()->json([
            'data'  =>$response
        ]);
    }
}
