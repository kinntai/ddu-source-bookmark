let s:data_directory_path = stdpath("data") . "/ddu_bookmark"
let s:data_file_name = "bookmark.json"
let s:default_group_name = "default"

function! ddu#source#bookmark#set_data_directory_path(path)
  let s:data_directory_path = a:path
endfunction

function! ddu#source#bookmark#get_data_directory_path()
  return fnamemodify(s:data_directory_path, ":p")
endfunction

function! ddu#source#bookmark#get_data_file_path()
  return ddu#source#bookmark#get_data_directory_path() . "/" . s:data_file_name
endfunction

function! ddu#source#bookmark#set_default_group(group)
  let s:default_group_name = a:group
endfunction

function! ddu#source#bookmark#get_default_group()
  return s:default_group_name
endfunction

function! ddu#source#bookmark#add(args) abort
  for item in a:args.items
    let path = item.action.path
    let param = {'path': path}
    let param.group = input('Input group name: ', ddu#source#bookmark#get_default_group())
    let param.name = input('Input bookmark name: ', fnamemodify(path, ':t'))

    call denops#notify('ddu_bookmark', 'add', [param])
  endfor
endfunction
