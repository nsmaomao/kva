# Kva
A simple javascript framework, like react & vue.

## Getting started

> import { h, Component, render, Store } from './kva'

## Create a component

> class Welcome extends Component {
>     constructor( props ) {
>         super( props )
>     }
>     render() {
>         return <div>kva</div>
>     }
> }

## Store

> var userStore = new Store({
>     name : 'kyo',
>     age : 18
> })
> userStore.onchange(function(data){
>     console.log(data)
> })

> userStore.set('name','kva')
