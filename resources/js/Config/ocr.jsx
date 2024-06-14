import { createWorker } from "tesseract.js";
import { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"


GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`

export const parse_image=async(url)=>{
    const worker=await createWorker("ind")
    const ret=await worker.recognize(url, {rotateAuto: true}, {imageColor: true, imageGrey: true, imageBinary: true})

    let data_lines=ret.data.lines

    let new_data_lines=[]
    for(var i=0; i<data_lines.length; i++){
      const line=data_lines[i]

      new_data_lines=new_data_lines.concat([
        {
          bbox:line.bbox,
          words:line.words.map(w=>{
            return {
              bbox:w.bbox,
              font_size:w.font_size,
              text:w.text
            }
          })
        }
      ])
    }

    const paragraph=generate_paragraph(new_data_lines)
    const processed=split_paragraph(paragraph)
    console.log(data_lines)
    return processed
}

export const parse_pdf=async(url)=>{
      const pdf=await getDocument(url).promise

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
      const worker=await createWorker("ind")
      const ret=await worker.recognize(
        canvas,
        'eng'
      )
      
      const data_lines=ret.data.lines
      let new_data_lines=[]
      for(var i=0; i<data_lines.length; i++){
        const line=data_lines[i]

        new_data_lines=new_data_lines.concat([
          {
            bbox:line.bbox,
            words:line.words.map(w=>{
              return {
                bbox:w.bbox,
                font_size:w.font_size,
                text:w.text
              }
            })
          }
        ])
      }

      const paragraph=generate_paragraph(new_data_lines)
      const processed=split_paragraph(paragraph)
      console.log(data_lines)
      return processed
}

const generate_paragraph=(lines=[])=>{
    const err_offset=3
    const line_height=7

    let paragraph=[]
    for(var i=0; i<lines.length; i++){
      if(i==0){
        paragraph=paragraph.concat([lines[i].words])
        continue
      }

      const distance=Number(lines[i].bbox.y0)-Number(lines[i-1].bbox.y1)
      if(distance<=(line_height+err_offset)){
        paragraph[paragraph.length-1]=paragraph[paragraph.length-1].concat(lines[i].words)
      }
      else{
        paragraph=paragraph.concat([lines[i].words])
      }
    }

    return paragraph
}

const split_paragraph=(paragraph=[])=>{
    let dot2_pos=-1
    for(var i=0; i<paragraph.length; i++){
      const filtered_dot2=paragraph[i].filter(f=>f.text.toString().trim()==":")
      if(filtered_dot2.length>0){
        dot2_pos=filtered_dot2[0].bbox.x1
        break
      }
    }
    
    if(dot2_pos==-1){
      return {
        error:true,
        message:"Titik dua tidak ditemukan!"
      }
    }

    const searcher=["(iku)", "(ik)", "program", "judul kegiatan"]
    let searcher_index=[-1, -1, -1, -1]
    let processed_paragraph=[]
    for(var i=0; i<paragraph.length; i++){
      const left_block=paragraph[i].filter(f=>f.bbox.x1<=dot2_pos).map(m=>m.text.toString().trim()).join(" ")
      const right_block=paragraph[i].filter(f=>f.bbox.x1>dot2_pos).map(m=>m.text.toString().trim()).join(" ")
      
      processed_paragraph=processed_paragraph.concat([
        {
          left_block,
          right_block
        }
      ])

      for(var j=0; j<searcher.length; j++){
        if(searcher_index[j]==-1){
          const found_dot2=left_block.toString().toLowerCase().includes(":")
          const found=left_block.toString().toLowerCase().includes(searcher[j].toString())

          if(found_dot2 && found){
            searcher_index[j]=i
            break
          }
        }
      }
    }

    return {
      error:false,
      data:processed_paragraph,
      searcher:searcher.map((s, idx)=>{
        return {
          type:s,
          index:searcher_index[idx]
        }
      })
    }
}