<?php

namespace App\Repository;

use App\Models\PesanWhatsappModel;

class PesanWhatsappRepo{

    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";

        //query
        $query=PesanWhatsappModel::query();
        $query=$query->where("pesan", "like", "%".$params['q']."%");

        $query=$query->orderByDesc("id_pesan_whatsapp");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}