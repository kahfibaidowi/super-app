<?php

namespace App\Repository;

use App\Models\UserModel;

class UserRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['role']=isset($params['role'])?trim($params['role']):"";
        $params['status']=isset($params['status'])?trim($params['status']):"";

        //query
        $query=UserModel::query();
        $query=$query->where("nama_lengkap", "like", "%".$params['q']."%");
        //--role
        if($params['role']!=""){
            $query=$query->where("role", $params['role']);
        }
        //--status
        if($params['status']!=""){
            $query=$query->where("status", $params['status']);
        }
        
        $query=$query->orderByDesc("id_user");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}