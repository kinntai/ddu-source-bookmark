if exists('g:loaded_ddu_bookmark')
  finish
endif
let g:loaded_ddu_bookmark = 1

" highlight! default link Denite_Dirmark_Name Statement
highlight! default link Ddu_Bookmark_Name Statement

if exists('*denops#plugin#is_loaded') && denops#plugin#is_loaded('ddu')
  call ddu#custom#action('kind', 'file', 'addBookmark', 'ddu#source#bookmark#add')
else
  augroup ddu_bookmark
    autocmd!
    autocmd User DenopsPluginPre:ddu
          \ call ddu#custom#action('kind', 'file', 'addBookmark', 'ddu#source#bookmark#add')
  augroup END
endif
