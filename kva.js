function h( tag, attrs, ...children ) {
    if ( typeof tag === 'function' ) {
        if (children) {
            if (!attrs) {
                attrs = {}
            }
            for(var i=0; i<children.length; i++) {
                let child = children[i]
                if (child && child.tag=='slot' && child.attrs && typeof child.attrs.name === 'string') {
                    attrs[child.attrs.name] = child
                }
            }
        }
    }
    return {
        tag,
        attrs,
        children
    }
}

function render (vnode, container) {
    return container.appendChild( renderDom( vnode ) )
}

function renderDom( vnode ) {
    // console.log(vnode)
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';
    if ( typeof vnode.tag === 'function' ) {
        console.log(vnode)
        const component = createComponent( vnode.tag, vnode.attrs )
        setComponentProps( component, vnode.attrs )
        return component.base
    }
    if ( typeof vnode === 'number' ) {
        vnode = vnode.toString()
    }
    if ( typeof vnode === 'string' ) {
        const textNode = document.createTextNode( vnode );
        return textNode
    }
    const dom = document.createElement( vnode.tag );
    if ( vnode.attrs ) {
        Object.keys( vnode.attrs ).forEach( key => {
            let rkey = key
            if ( key === 'className' ) rkey = 'class';
            if ( /on\w+/.test( key ) ) {
                rkey = key.toLowerCase();
                dom[ key ] = vnode.attrs[ key ];
                dom.setAttribute( rkey, 'this.'+key+'()')
            } else {
                dom.setAttribute( rkey, vnode.attrs[ key ] )
            }
        } );
    }
    vnode.children.forEach( (child) => {
        if ( Array.isArray(child) ) {
            for (var i=0; i<child.length; i++) {
                render( child[i], dom )
            }
            return
        }
        render( child, dom )
    });
    return dom
}

class Component {
    constructor( props = {} ) {
        let app = this
        const handler = {
            get : function (target, name) {
                if (target[name]===undefined) {
                    target[name] = ''
                }
                return target[name]
            },
            set : function (target,name,newValue) {
                target[name] = newValue
                renderComponent( app )
                return true
            }
        }
        this.state = new Proxy({}, handler)
        this.props = props
    }
    /* setState( stateChange ) {
        Object.assign( this.state, stateChange )
        renderComponent( this )
    } */
    viewUpdate () {
        renderComponent( this )
    }
}

function createComponent( component, props ) {
    let inst;
    if ( component.prototype && component.prototype.render ) {
        inst = new component( props );
    } else {
        inst = new Component( props );
        inst.constructor = component;
        inst.render = function() {
            return this.constructor( props );
        }
    }
    return inst;
}

function setComponentProps( component, props ) {
    component.props = props
    renderComponent( component )
}

function renderComponent( component ) {
    let base
    const renderer = component.render()
    base = diff( component.base, renderer )
    /* if ( component.base && component.base.parentNode ) {
        component.base.parentNode.replaceChild( base, component.base );
    } */
    component.base = base
    base._component = component
}

function diff( dom, vnode ) {
    let out = dom;
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';
    if ( typeof vnode === 'number' ) vnode = String( vnode );
    if ( typeof vnode.tag === 'function' ) {
        return diffComponent(dom, vnode)
    }
    if ( typeof vnode === 'string' ) {
        if ( dom && dom.nodeType === 3 ) {
            if ( dom.textContent !== vnode ) {
                dom.textContent = vnode;
            }
        } else {
            out = document.createTextNode( vnode );
            if ( dom && dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );
            }
        }
        return out;
    }
    if ( !dom || !isSameNodeType( dom, vnode ) ) {
        out = document.createElement( vnode.tag );
        if ( dom ) {
            [ ...dom.childNodes ].map( out.appendChild );
            if ( dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );
            }
        }
    }
    if ( vnode.children && vnode.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
        diffChildren( out, vnode.children );
    }
    diffAttributes( out, vnode );
    return out;
}

function diffComponent( dom, vnode ) {
    let c = dom && dom._component;
    let oldDom = dom;
    if ( c && c.constructor === vnode.tag ) {
        setComponentProps( c, vnode.attrs );
        dom = c.base;
    } else {
        if ( c ) {
            unmountComponent( c );
            oldDom = null;
        }
        c = createComponent( vnode.tag, vnode.attrs );
        setComponentProps( c, vnode.attrs );
        dom = c.base;
        if ( oldDom && dom !== oldDom ) {
            oldDom._component = null;
            removeNode( oldDom );
        }
    }
    return dom;
}

function diffAttributes( dom, vnode ) {
    const old = dom.attributes;
    const attrs = vnode.attrs;
    if (!attrs) {
        for ( var i; i<old.length; i++ ) {
            let name = old[i]
            setAttribute( dom, name, undefined );
        }
    } else {
        for ( var i; i<old.length; i++ ) {
            let name = old[i]
            if ( !( name in attrs ) ) {
                setAttribute( dom, name, undefined );
            }
        }
    }
    for ( let name in attrs ) {
        if ( old[ name ] !== attrs[ name ] ) {
            setAttribute( dom, name, attrs[ name ] );
        }
    }
}

function setAttribute( dom, name, value ) {
    if ( name === 'className' ) name = 'class';
    if ( /on\w+/.test( name ) ) {
        name = name.toLowerCase();
        dom[ name ] = value || '';
    } else if ( name === 'style' ) {
        if ( !value || typeof value === 'string' ) {
            node.style.cssText = value || '';
        } else if ( value && typeof value === 'object' ) {
            for ( let name in value ) {
                dom.style[ name ] = typeof value[ name ] === 'number' ? value[ name ] + 'px' : value[ name ];
            }
        }
    } else {
        if ( name in dom ) {
            dom[ name ] = value || '';
        }
        if ( value ) {
            dom.setAttribute( name, value );
        } else {
            dom.removeAttribute( name, );
        }
    }
}

function diffChildren( dom, vchildren ) {
    const domChildren = dom.childNodes;
    const children = [];
    const keyed = {};
    if ( domChildren.length > 0 ) {
        for ( let i = 0; i < domChildren.length; i++ ) {
            const child = domChildren[ i ];
            const key = child.key;
            if ( key ) {
                keyedLen++;
                keyed[ key ] = child;
            } else {
                children.push( child );
            }
        }
    }
    if ( vchildren && vchildren.length > 0 ) {
        let min = 0;
        let childrenLen = children.length;
        for ( let i = 0; i < vchildren.length; i++ ) {
            const vchild = vchildren[ i ];
            const key = vchild.key;
            let child;
            if ( key ) {
                if ( keyed[ key ] ) {
                    child = keyed[ key ];
                    keyed[ key ] = undefined;
                }
            } else if ( min < childrenLen ) {
                for ( let j = min; j < childrenLen; j++ ) {
                    let c = children[ j ];
                    if ( c && isSameNodeType( c, vchild ) ) {
                        child = c;
                        children[ j ] = undefined;
                        if ( j === childrenLen - 1 ) childrenLen--;
                        if ( j === min ) min++;
                        break;
                    }
                }
            }
            child = diff( child, vchild );
            const f = domChildren[ i ];
            if ( child && child !== dom && child !== f ) {
                if ( !f ) {
                    dom.appendChild(child);
                } else if ( child === f.nextSibling ) {
                    removeNode( f );
                } else {
                    dom.insertBefore( child, f );
                }
            }
        }
    }
}

function isSameNodeType( dom, vnode ) {
    if ( typeof vnode === 'string' || typeof vnode === 'number' ) {
        return dom.nodeType === 3;
    }

    if ( typeof vnode.tag === 'string' ) {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
    }
    return dom && dom._component && dom._component.constructor === vnode.tag;
}

function removeNode( dom ) {
    if ( dom && dom.parentNode ) {
        dom.parentNode.removeChild( dom );
    }
}

class Store {
    constructor (props) {
        if (props instanceof Object) {
            this.data = props
        } else {
            this.data = {}
        }
        this.cb = function () {}
    }
    set (name, value) {
        this.data[name] = value
        this.cb(this.data)
    }
    get (name) {
        return this.data[name]
    }
    onchange (cb) {
        this.cb = cb
    }
}

export { h, Component, render, Store }
