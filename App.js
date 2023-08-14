
// variables:

let keyword='';
let top_gainers;
let top_losers;

let clicked;
let searched_company;

let curr_choice;
let prev_choice= curr_choice;

let details_container;


// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// urls:

const api_key= `&apikey=E9K6B8RBKA3ZCFPD`;

const url= `https://www.alphavantage.co/query?function=`;
const interval= `&interval=15min`

const intraday_url = url + `TIME_SERIES_INTRADAY&symbol=`;
const daily_url_part_1= url + `TIME_SERIES_DAILY&symbol=`;
const daily_url_part_2= '&outputsize=full';

const weekly_url= url + `TIME_SERIES_WEEKLY&symbol=`;

const monthly_url= url + `TIME_SERIES_MONTHLY&symbol=`;

const auto_complete_search_endpoint_url= url + `SYMBOL_SEARCH&keywords=`;
const quote_endpoint_url= url + `GLOBAL_QUOTE&symbol=`;

const top_gainers_losers_url= url + `TOP_GAINERS_LOSERS` + api_key;


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// elements

const search_bar= document.getElementById('search-bar');
const suggestions_container= document.getElementById('suggestion-container');
const trading_options= document.querySelector('.trading-ways');
const main_container= document.getElementById('main-container');
const wachlist_btn= document.getElementById('watchlist');



// ----------------------------------------------------------------------------------------------------------------------------------------

// local storage operations:

function get_stocks_from_local() {
    const list_of_stocks_string= JSON.parse(localStorage.getItem('my_stock_list'));

    if(list_of_stocks_string == null || list_of_stocks_string == undefined) {
        return [];        
    } else {
        return list_of_stocks_string;
    }
}

function set_stocks_in_local(stock_name) {
    const stock_list= get_stocks_from_local();

    let is_present= false;

    for(let i=0; i<stock_list.length; i++) {
        if(stock_list[i] == stock_name) {
            is_present= true;
            break;
        }
    }

    let modified_stock_list= stock_list;
    if(!is_present) {
        modified_stock_list= [...stock_list, stock_name];
    }

    localStorage.setItem('my_stock_list', JSON.stringify(modified_stock_list));
}

function remove_stocks_from_local(stock_name) {
    const stock_list= get_stocks_from_local();

    const filtered_stocks_list= stock_list.filter((name) => name != stock_name);

    localStorage.setItem('my_stock_list', JSON.stringify(filtered_stocks_list));
}




// basic functions:

async function fetch_data(url) {
    try {
        const response= await fetch(url);
        const data= await response.json();

        return data;

    } catch(error) {
        alert('not available');
    }
}

function render_stock(stock, parent) {

    const my_stock_list= get_stocks_from_local();

    let {price_diff, percentage_diff, price, company, volume}= stock;

        const is_added= my_stock_list.indexOf(company) > -1;
        
        const topper_div= document.createElement('div');
        topper_div.setAttribute('class', 'topper-div');
        topper_div.setAttribute("id", `topper-div-${company}`);
        parent.appendChild(topper_div);

            const item= document.createElement('button');
            item.setAttribute('class','topper');
            item.setAttribute('id', `topper-${company}`);
            topper_div.appendChild(item);
            
                const company_name= document.createElement('h3');
                company_name.setAttribute('class', `company-name`);
                company_name.textContent= `${company}`;
                item.appendChild(company_name);

                const toppers_meta_container= document.createElement('div');
                toppers_meta_container.setAttribute('class',`toppers-meta-container`);
                item.appendChild(toppers_meta_container);

                    const price_vol_container= document.createElement(`div`);
                    price_vol_container.setAttribute('class',`price-vol-container`);
                    toppers_meta_container.appendChild(price_vol_container);

                        const company_price= document.createElement('p');
                        company_price.setAttribute('class', `company-price`);
                        company_price.textContent= `${price}`;
                        price_vol_container.appendChild(company_price);

                        const company_vol= document.createElement(`p`);
                        company_vol.setAttribute('class', 'company-volume');
                        company_vol.textContent= `Vol: ${volume}`;
                        price_vol_container.appendChild(company_vol);

                    const diff_container= document.createElement(`div`);
                    diff_container.setAttribute('class',`diff-container`);
                    toppers_meta_container.appendChild(diff_container);

                        const numeric_diff= document.createElement(`p`);
                        numeric_diff.setAttribute(`class`, `numeric-diff`);
                        
                        if(price_diff < 0) {
                            numeric_diff.innerHTML= `${price_diff.slice(1)}`;
                            numeric_diff.style.color= `#ed0101`;
                        } else {
                            numeric_diff.innerHTML= `${price_diff}`;
                            numeric_diff.style.color=`#00c695` ;
                        }
                        diff_container.appendChild(numeric_diff);


                        const percent_difference= document.createElement('p');
                        percent_difference.setAttribute('class', `percentage-diff`);
                        

                        if(price_diff < 0) {
                            percent_difference.textContent = `${percentage_diff.slice(1)}`;
                            percent_difference.style.color= `#ed0101`;
                        } else {
                            percent_difference.textContent = `${percentage_diff}`;
                            percent_difference.style.color=`#00c695` ;
                        }
                        diff_container.appendChild(percent_difference);

                    if(is_added) {
                        const remove_btn= document.createElement(`button`);
                        remove_btn.setAttribute(`class`, `remove-btn`);
                        remove_btn.setAttribute(`id`, `btn-${company}`);
                        toppers_meta_container.appendChild(remove_btn);

                            const remove_icon= document.createElement('i');
                            remove_icon.setAttribute('class', 'fa-solid fa-trash');
                            remove_icon.setAttribute('id', `${company}`);
                            remove_btn.appendChild(remove_icon);
                    } else {
                        const add_btn= document.createElement(`button`);
                        add_btn.setAttribute(`class`, `add-btn`);
                        add_btn.setAttribute(`id`, `btn-${company}`);
                        toppers_meta_container.appendChild(add_btn);

                            const add_icon= document.createElement('i');
                            add_icon.setAttribute('class', 'fa-solid fa-plus');
                            add_icon.setAttribute('id', `${company}`);
                            add_btn.appendChild(add_icon);
                    }

            // for an entire stock button
            let clicked_on_stock= true;
            item.addEventListener('click', (event) => {
                if(clicked_on_stock) {
                    const stock_id= item.id;

                    reset_all_btn();
                    render_details_container(topper_div, stock_id);
                    clicked_on_stock= false;
                } else {
                    const details_container= document.querySelector('.details-container');
                    details_container.innerHTML= '';
                    details_container.style.display= 'none';
                    clicked_on_stock =true;
                }
            });


            // for add-button of perticular stock

            const button_to_add_or_remove_from_watchlist= document.getElementById(`btn-${company}`);
            button_to_add_or_remove_from_watchlist.addEventListener("click", (event) => {
                event.stopPropagation();

                if(button_to_add_or_remove_from_watchlist.className == 'add-btn') {
                    set_stocks_in_local(company);
                    

                    button_to_add_or_remove_from_watchlist.childNodes[0].classList.remove(`fa-plus`);
                    button_to_add_or_remove_from_watchlist.childNodes[0].classList.add(`fa-trash`);
                   
                    button_to_add_or_remove_from_watchlist.className= 'remove-btn';

                    button_to_add_or_remove_from_watchlist.style.backgroundColor= 'rgb(243, 212, 212)';
                    button_to_add_or_remove_from_watchlist.style.color= '#ed0101';

                } else {
                    remove_stocks_from_local(company);

                    const fa_solid= document.querySelector('.fa-solid');

                    
                    
                    button_to_add_or_remove_from_watchlist.childNodes[0].classList.remove(`fa-trash`);
                    button_to_add_or_remove_from_watchlist.childNodes[0].classList.add(`fa-plus`);

                    button_to_add_or_remove_from_watchlist.className= 'add-btn';

                    button_to_add_or_remove_from_watchlist.style.backgroundColor= '#b6ffed';
                    button_to_add_or_remove_from_watchlist.style.color= '#00c695';
                }
            });

}

function render_details_container(parent, stock_id) {
    const prev_details_container= document.querySelector('.details-container');
    if(prev_details_container) {
        prev_details_container.remove();

    }
    

    const details_container= document.createElement('div');
    details_container.setAttribute('class','details-container');
    parent.appendChild(details_container);

        const details_sub_container= document.createElement('div');
        details_sub_container.setAttribute('class','details-sub-container');
        details_container.appendChild(details_sub_container);

            const meta_container1= document.createElement('div');
            meta_container1.classList= 'meta-container date-container';
            details_sub_container.appendChild(meta_container1);

                 const date_title= document.createElement('h5');
                 date_title.setAttribute('class', 'meta-title-heading');
                 date_title.textContent='Date';
                 meta_container1.appendChild(date_title);

                 const data_of_date= document.createElement('div');
                 data_of_date.setAttribute('class', 'perticular-data');
                 data_of_date.setAttribute('id', 'data-of-dates')
                 meta_container1.appendChild(data_of_date);
                

            const meta_container2= document.createElement('div');
            meta_container2.classList= 'meta-container open-price-container';
            details_sub_container.appendChild(meta_container2);

                 const open_price_title= document.createElement('h5');
                 open_price_title.setAttribute('class', 'meta-title-heading');
                 open_price_title.textContent='Open';
                 meta_container2.appendChild(open_price_title);

                 const data_of_open_prices= document.createElement('div');
                 data_of_open_prices.setAttribute('class', 'perticular-data');
                 data_of_open_prices.setAttribute('id', 'data-of-open-prices');
                 meta_container2.appendChild(data_of_open_prices);


            const meta_container3= document.createElement('div');
            meta_container3.classList= 'meta-container close-price-container';
            details_sub_container.appendChild(meta_container3);

                 const close_price_title= document.createElement('h5');
                 close_price_title.setAttribute('class', 'meta-title-heading');
                 close_price_title.textContent='Close';
                 meta_container3.appendChild(close_price_title);

                 const data_of_closed_prices= document.createElement('div');
                 data_of_closed_prices.setAttribute('class', 'perticular-data');
                 data_of_closed_prices.setAttribute('id', 'data-of-closed-prices');
                 meta_container3.appendChild(data_of_closed_prices);

            const meta_container4= document.createElement('div');
            meta_container4.classList= 'meta-container high-price-container';
            details_sub_container.appendChild(meta_container4);

                 const high_price_title= document.createElement('h5');
                 high_price_title.setAttribute('class', 'meta-title-heading');
                 high_price_title.textContent='High';
                 meta_container4.appendChild(high_price_title);

                 const data_of_high_price= document.createElement('div');
                 data_of_high_price.setAttribute('class', 'perticular-data');
                 data_of_high_price.setAttribute('id', 'data-of-high-price');
                 meta_container4.appendChild(data_of_high_price);

            const meta_container5= document.createElement('div');
            meta_container5.classList= 'meta-container low-price-container';
            details_sub_container.appendChild(meta_container5);

                 const low_price_title= document.createElement('h5');
                 low_price_title.setAttribute('class', 'meta-title-heading');
                 low_price_title.textContent='Low';
                 meta_container5.appendChild(low_price_title);

                 const data_of_low_price= document.createElement('div');
                 data_of_low_price.setAttribute('class', 'perticular-data');
                 data_of_low_price.setAttribute('id', 'data-of-low-price');
                 meta_container5.appendChild(data_of_low_price);


            const meta_container6= document.createElement('div');
            meta_container6.classList= 'meta-container volume-container';
            details_sub_container.appendChild(meta_container6);

                 const volume_title= document.createElement('h5');
                 volume_title.setAttribute('class', 'meta-title-heading');
                 volume_title.textContent='Volume';
                 meta_container6.appendChild(volume_title);

                 const data_of_volume= document.createElement('div');
                 data_of_volume.setAttribute('class', 'perticular-data');
                 data_of_volume.setAttribute('id', 'data-of-volume');
                 meta_container6.appendChild(data_of_volume);

        fill_meta_details(clicked,stock_id);

}

async function fill_meta_details(clicked, stock_id) {
    let url;
    searched_company= stock_id.slice(7);
    if(clicked == 'intraday') {
        url= intraday_url +searched_company + interval + api_key;
    } else if(clicked == 'daily') {
        url= daily_url_part_1 + searched_company + daily_url_part_2 + api_key;
    } else if(clicked == 'weekly') {
        url= weekly_url + searched_company + api_key;
    } else {
        url= monthly_url + searched_company + api_key;
    }

    const data= await fetch_data(url);

    // if(!data['Error Message'] && !data['Note']) {

        let obj;

        if(clicked == 'intraday') {
            obj= data['Time Series (15min)'];
        } else if(clicked == 'daily') {
            obj= data['Daily Time Series'];
        } else if(clicked == 'weekly') {
            obj= data['Weekly Time Series'];
        } else {
            obj= data['Monthly Time Series'];
        }

    
        let date_arr= [];
        let open_price_arr= [];
        let closed_price_arr= [];
        let high_price_arr= [];
        let low_price_arr= [];
        let volume_arr= [];

        const changed_obj= Object.keys(obj).slice(0,5);
        
        for(let i=0; i<changed_obj.length; i++) {
            date_arr[i]= changed_obj[i];
            open_price_arr[i]= obj[changed_obj[i]]['1. open'];
            closed_price_arr[i]= obj[changed_obj[i]]['4. close'];
            high_price_arr[i]= obj[changed_obj[i]]['2. high'];
            low_price_arr[i]= obj[changed_obj[i]]['3. low'];
            volume_arr[i]= obj[changed_obj[i]]['5. volume'];
            
        }

        const date_container= document.getElementById('data-of-dates');
        const open_price_container= document.getElementById('data-of-open-prices');
        const closed_price_container= document.getElementById('data-of-closed-prices');
        const high_price_container= document.getElementById('data-of-high-price');
        const low_price_container= document.getElementById('data-of-low-price');
        const volume_container= document.getElementById('data-of-volume');

        high_price_container.style.color= '#00c695';
        low_price_container.style.color= '#ed0101';

        date_container.textContent= '';
        open_price_container.textContent= '';
        closed_price_container.textContent= '';
        high_price_container.textContent= '';
        low_price_container.textContent= '';
        volume_container.textContent='';

        for(let i=0; i<5; i++) {

            add_list_element_inside_data_container(date_container, date_arr[i]);
            add_list_element_inside_data_container(open_price_container, open_price_arr[i]);
            add_list_element_inside_data_container(closed_price_container, closed_price_arr[i]);
            add_list_element_inside_data_container(high_price_container, high_price_arr[i]);
            add_list_element_inside_data_container(low_price_container, low_price_arr[i]);
            add_list_element_inside_data_container(volume_container, volume_arr[i]);
        } 
}

function add_list_element_inside_data_container(parent, data) {
    const list= document.createElement('li');
    list.setAttribute('class', 'list-in-meta-container');
    list.textContent= `${data}`;

    parent.appendChild(list);
}

async function render_wachlist_section() {

    const back_btn= document.createElement('button');
    back_btn.setAttribute('class', 'back-btn-for-search');
    back_btn.textContent='Back';
    main_container.appendChild(back_btn);

    back_btn.addEventListener('click',(event) => {
        reset_all_btn();
        wachlist_btn.style.color= '#00c695';
        wachlist_btn.style.backgroundColor= '#b6ffed';
    
        main_container.innerHTML= '';
        paint_toppers(top_gainers_losers_url);
    });

    const watchlist_section= document.createElement('div');
    watchlist_section.setAttribute('class', 'watchlist-section');
    main_container.appendChild(watchlist_section);

    const fav_stocks= get_stocks_from_local();

    for(let i=0; i<fav_stocks.length; i++) {

        const stock_name= fav_stocks[i];
        const url= quote_endpoint_url + stock_name + api_key;

        const data= await fetch_data(url);
        const stock= data['Global Quote'];

        const changed_data= {
            company: stock['01. symbol'],
            open: stock['02. open'],
            close: stock['08. previous close'],
            high: stock['03. high'],
            low: stock['04. low'],
            price: stock['05. price'],
            volume: stock['06. volume'],
            price_diff: stock['09. change'],
            percentage_diff: stock['10. change percent'],
        }

        render_stock(changed_data, watchlist_section);
    }
    
}
function reset_all_btn() {
    // search_bar.value= '';

    suggestions_container.innerHTML= '';
    suggestions_container.style.display= 'none';
}




// search-bar

    function debounce(callback, delay) {
        try {
                
            let timer;

            return function() {
                let event= arguments[0];
                clearTimeout(timer);

                timer= setTimeout(() => {
                    callback(event);
                }, delay);
            }
        } catch(error) {
            alert(`error: not found`);
        }
    }

    function render_search_name(stock_list) {
        suggestions_container.innerHTML= '';
        suggestions_container.style.display= 'block';
        stock_list.forEach((stock) => {
            let {id, company}= stock;

            const suggestions_container_1= document.createElement('div');
            suggestions_container_1.setAttribute('class', 'suggestions-div');
            suggestions_container_1.setAttribute('id', 'suggestion-container-1');
            suggestions_container.appendChild(suggestions_container_1);

                const suggestion_1= document.createElement('button');
                suggestion_1.setAttribute('class', 'suggestion');
                suggestion_1.setAttribute('id', `stock-${id}`);
                suggestion_1.textContent= `${id}`;
                suggestions_container_1.appendChild(suggestion_1);


            suggestion_1.addEventListener('click', (event) => {

                suggestions_container.style.display= 'none';

                searched_company= event.target.textContent;

                search_bar.value= searched_company;

                suggestions_container.innerHTML= '';
                main_container.innerHTML= '';

                const back_btn= document.createElement('button');
                back_btn.setAttribute('class', 'back-btn-for-search');
                back_btn.textContent='Back';
                main_container.appendChild(back_btn);

                const searched_stock_section= document.createElement('div');
                searched_stock_section.setAttribute('class','searched-stock-section');
                main_container.appendChild(searched_stock_section);

                    const searched_stock= document.createElement('button');
                    searched_stock.setAttribute('class', 'searched-stock');
                    searched_stock.setAttribute('id',`searched-stock-${id}`);
                    searched_stock_section.appendChild(searched_stock);

                        const url= quote_endpoint_url + id + api_key;

                        render_searched_stock(url, id, company, searched_stock);

                back_btn.addEventListener('click',(event) => {
                    reset_all_btn();
                    main_container.innerHTML= '';
                    paint_toppers(top_gainers_losers_url);
                });
            
            });    
        });
    }

    async function paint_search_name(word) {
        
            try {
                
                const url= auto_complete_search_endpoint_url+word+api_key;
                const data= await fetch_data(url);

                let arr= data.bestMatches;

                const changed_data= arr.map(item => {
                    return {
                        id: item[`1. symbol`],
                        company: item[`2. name`],
                        type: item[`3. type`],
                    }  
                });
                
                render_search_name(changed_data);

            } catch(error) {
                alert(`Not found`);
            }
    }
    
    async function render_searched_stock(url, id, company_name, parent) {
        try {
            const data= await fetch_data(url);

            let arr= data['Global Quote'];
    
            const changed_data= {
                company: id,
                open: arr['02. open'],
                close: arr['08. previous close'],
                high: arr['03. high'],
                low: arr['04. low'],
                price: arr['05. price'],
                volume: arr['06. volume'],
                price_diff: arr['09. change'],
                percentage_diff: arr['10. change percent'],
            }

            render_stock(changed_data, parent)

        } catch(error) {
            alert('Error: Not found');
        }

    }  



    // search_name('A');
    function search_callback_function(event) {
        keyword= event.target.value;
        if(keyword) {
            const searched_list= paint_search_name(keyword);
            return searched_list;
        } else {
            reset_all_btn();
        }
        
        
    }

    
    
// top gainers and losers section

function remap_topper_data(stockList) {
    const modified_list= stockList.map(stock => {
        return {
            price_diff: stock.change_amount,
            percentage_diff: stock.change_percentage,
            price: stock.price,
            company: stock.ticker,
            volume: stock.volume,
        }
    });

    return modified_list;
}

async function paint_toppers(url) {
    try {
        const data= await fetch_data(url);

        const gainers= data.top_gainers;
        const losers= data.top_losers;

        const modified_top_gainers= remap_topper_data(gainers);
        const modified_top_losers= remap_topper_data(losers);

        top_gainers= modified_top_gainers;
        top_losers= modified_top_losers;

        render_topper_container();

    } catch(error) {
        alert("Error: Not found");
    }
}


function render_topper_container() {

    main_container.innerHTML= '';

    // top gainers
    const top_gainers_container= document.createElement('div');
    top_gainers_container.setAttribute('class', `top-gainers-container`);
    main_container.appendChild(top_gainers_container);

        const top_gainers_title= document.createElement('div');
        top_gainers_title.textContent='Top Gainers';
        top_gainers_title.setAttribute('class', `top-gainers-title`);
        top_gainers_container.appendChild(top_gainers_title);

        const top_gainers_section= document.createElement('div');
        top_gainers_section.setAttribute('class', `top-gainers-section`);
        top_gainers_container.appendChild(top_gainers_section);

        rendering_stocks_of_toppers(top_gainers, top_gainers_section);

    // top losers
    const top_losers_container= document.createElement('div');
    top_losers_container.setAttribute('class', `top-losers-container`);
    main_container.appendChild(top_losers_container);

        const top_losers_title= document.createElement('div');
        top_losers_title.textContent='Top Losers';
        top_losers_title.setAttribute('class', `top-losers-title`);
        top_losers_container.appendChild(top_losers_title);

        let top_losers_section= document.createElement('div');
        top_losers_section.setAttribute('class', `top-losers-section`);
        top_losers_container.appendChild(top_losers_section);

        rendering_stocks_of_toppers(top_losers, top_losers_section); 
}   

function rendering_stocks_of_toppers(stock_list, parent) {

    stock_list.forEach((stock) => {
        render_stock(stock, parent);
    });
}




// ---------------------------------------------------------------------------------------------------

const debounced_search= debounce(search_callback_function, 500);

search_bar.addEventListener('keyup', debounced_search);


trading_options.addEventListener('click', (event) => {

    clicked= event.target.id;

    prev_choice= curr_choice;
    curr_choice= document.getElementById(clicked);

    if((clicked == 'intraday' || clicked == 'daily' || clicked == 'weekly' ||
    clicked == 'monthly') && search_bar.value != '') {

        curr_choice.style.color= '#b6ffed';
        curr_choice.style.backgroundColor= '#00c695';

        if(prev_choice != undefined) {
            prev_choice.style.color= '#00c695';
            prev_choice.style.backgroundColor= '#b6ffed';
        } 

        fill_meta_details(clicked, `topper-${search_bar.value}`);
    } else {
        alert('please enter stock name inside search-box')
    }

});

paint_toppers(top_gainers_losers_url);

wachlist_btn.addEventListener('click', (event) => {

    wachlist_btn.style.backgroundColor= '#00c695';
    wachlist_btn.style.color= '#b6ffed';

    main_container.innerHTML= '';
    render_wachlist_section();
})