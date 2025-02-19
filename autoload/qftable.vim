function qftable#show(columns, printer, formatter)
  call denops#notify("qftable", "show", [a:columns, a:printer, a:formatter])
endfunction
