<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KontakModel extends Model
{
    use HasFactory;

    protected $table="tbl_kontak";
    protected $primaryKey="id_kontak";

    protected $fillable = [
        'no_hp',
        'nama_lengkap'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
    ];

    
    //relationship
}
