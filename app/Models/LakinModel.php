<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LakinModel extends Model
{
    use HasFactory;

    protected $table="tbl_lakin";
    protected $primaryKey="id_lakin";

    protected $fillable = [
        'type',
        'content'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
        'content'   =>"array"
    ];

    
    //relationship
}
