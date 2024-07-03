<?php

namespace App\Repository;

use App\Models\KontakModel;
use App\Models\KontakGroupModel;

class KontakRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //query
        $query=KontakModel::query();
        $query=$query->where(function($q)use($params){
            $q->where("nama_lengkap", "like", "%".$params['q']."%")
                ->orWhere("no_hp", "like", "%".$params['q']."%");
        });

        $query=$query->orderByDesc("id_kontak");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }

    public static function gets_group($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //query
        $query=KontakGroupModel::with("kontak");
        $query=$query->where("nama_group", "like", "%".$params['q']."%");

        $query=$query->orderByDesc("id_group");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}