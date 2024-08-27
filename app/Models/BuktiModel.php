<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuktiModel extends Model
{
    use HasFactory;

    protected $table="tbl_bukti";
    protected $primaryKey="id_bukti";

    protected $fillable = [
        'id_ppepp',
        'deskripsi',
        'file',
        'link',
        'link_external'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];

    
    //relationship
    public function sub_ppepp(){
        return $this->belongsTo(PpeppModel::class, "id_ppepp", "id_ppepp");
    }
}
