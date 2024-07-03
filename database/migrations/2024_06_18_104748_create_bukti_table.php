<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_bukti', function (Blueprint $table) {
            $table->id("id_bukti");
            $table->unsignedBigInteger("id_ppepp")->comment("sub ppepp");
            $table->string("type");
            $table->text("deskripsi");
            $table->text("file");
            $table->text("link");
            $table->timestamps();
            
            //fk
            $table->foreign("id_ppepp")->references("id_ppepp")->on("tbl_ppepp")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_bukti');
    }
};
