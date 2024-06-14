<?php

namespace App\Repository;

use App\Models\ActivityProdiModel;

class ActivityProdiRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //query
        $query=ActivityProdiModel::query();
        $query=$query->where(function($q)use($params){
            $q->where("iku", "like", "%".$params['q']."%")
                ->orWhere("ik", "like", "%".$params['q']."%")
                ->orWhere("program", "like", "%".$params['q']."%")
                ->orWhere("judul_kegiatan", "like", "%".$params['q']."%");
        });

        $query=$query->orderByDesc("id_activity_prodi");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}