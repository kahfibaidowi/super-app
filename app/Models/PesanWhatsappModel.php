<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PesanWhatsappModel extends Model
{
    use HasFactory;

    protected $table="tbl_pesan_whatsapp";
    protected $primaryKey="id_pesan_whatsapp";

    protected $fillable = [
        'penerima',
        'pesan',
        'file',
        'status',
        'jadwal_kirim',
        'data'
    ];
    protected $perPage=99999999999999999999;

    protected $casts = [
        'penerima'  =>"array",
        'file'      =>"array",
        'data'      =>"array"
    ];

    // protected function jadwalKirim():Attribute
    // {
    //     return Attribute::make(
    //         get:fn($value)=>Carbon::parse($value)->timezone(env("APP_TIMEZONE"))
    //     );
    // }

    
    //relationship
}
