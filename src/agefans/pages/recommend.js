import $ from 'jquery'
import { pagePreview } from '../utils/pagePreview'
export function recommendModule() {
  $('ul.ul_li_a6 > li > a').each((_, anchor) =>
    pagePreview(anchor.parentNode, anchor.href)
  )
}
