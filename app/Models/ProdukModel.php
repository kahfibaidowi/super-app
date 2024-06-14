<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProdukModel extends Model
{
    use HasFactory;

    protected $table="tbl_produk";
    protected $primaryKey="id_produk";

    protected $fillable = [
        'id_produk',
        'id_kategori',
        'no_sku',
        'nama_produk',
        'satuan',
        'harga_jual',
        'qty_incoming',
        'qty_outcoming',
        'qty_real',
        'qty_gudang',
        'foto_produk'
    ];
    protected $perPage=99999999999999999999;


    //RELATIONSHIP
    public function kategori(){
        return $this->belongsTo(KategoriModel::class, "id_kategori", "id_kategori");
    }
}
