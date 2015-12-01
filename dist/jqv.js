(function (root, factory) {
  root.jqv = factory();
}(this, function () {
  var jqv = {};


  function json2html(tmp, opts) {
    if (typeof tmp == 'string') return tmp;
    if (typeof tmp == 'function') return tmp(opts);
    if (typeof tmp.length == 'undefined') tmp = [tmp];
    var output = [];
    tmp.map(function (n) {
      if (!n.tag) return;

      var tag = n.tag;
      output.push('<' + n.tag)
      delete n.tag;

      if (n.content)
        var content = json2html(n.content, opts);
      delete n.content;
      var k = Object.keys(n);
      k.map(function (a) {
        if (typeof n[a] == 'function')
          n[a] = n[a](opts);
        if (n[a] !== false)
          output.push(' ' + a + '="' + n[a] + '"');
      });

      if (['br', 'embed', 'hr', 'img', 'input', 'link'].indexOf(tag) > -1) {
        output.push('>');
      } else {
        output.push('>' + content + '</' + tag + '>');
      }
    });
    return output.join('');
  }


  jqv.new = function (template, obj, ondraw) {
    if (typeof template != 'string')
      template = json2html(template);
    var rTemplate = Mustache.render(template, obj);
    var $ret = $(rTemplate);
    $ret.draw = function () {
      rTemplate = Mustache.render(template, obj);
      $ret.diffhtml($(rTemplate));
      if (typeof ondraw == 'function')
        ondraw();
    };
    return $ret;
  };

  return jqv;
}));



(function () {
  var domdiff_NamespaceString, domdiff_NamespaceNext, domdiff_nodeLength, domdiff_nodeLeaf, domdiff_nodeSame, domdiff_attrIntersection, domdiff_attrDifference, domdiff_nodeAttrRemove, domdiff_nodeAttrReplace, domdiff_nodeAttrValueEqual, domdiff_diffAttributes, domdiff_nodeRetrieve, domdiff_nodeAction, domdiff_nodeRemove, domdiff_nodeAppend, domdiff_nodeReplace, domdiff_nodeExactly, domdiff_diff, domdiff_applyDiff, jquery, integration_jquerydiffhtml;
  domdiff_NamespaceString = function () {
    /**
     * Namespace object
     *
     * @constructor
     */
    function NamespaceString(namespace, index) {
      this.namespace = namespace;
      this.index = index || 0;
    }
    NamespaceString.prototype.parent = function () {
      return this;
    };
    NamespaceString.prototype.toString = function () {
      return this.namespace;
    };
    NamespaceString.prototype.pop = function () {
      --this.index;
      return this;
    };
    NamespaceString.prototype.push = function () {
      ++this.index;
      return this;
    };
    return NamespaceString;
  }();
  domdiff_NamespaceNext = function (NamespaceString) {

    /**
     * Generalisation of namespace
     *
     * @constructor
     */
    function NamespaceNext(namespace, index) {
      NamespaceString.call(this, namespace, index);
    }
    NamespaceNext.prototype = Object.create(NamespaceString.prototype);
    NamespaceNext.prototype.parent = function () {
      return this.namespace;
    };
    NamespaceNext.prototype.toString = function () {
      return this.namespace + '.childNodes[' + this.index + ']';
    };
    NamespaceString.prototype.next = function (index) {
      return new NamespaceNext(this, index);
    };
    return NamespaceNext;
  }(domdiff_NamespaceString);
  domdiff_nodeLength = function nodeLength(node) {
    return node.childNodes.length;
  };
  domdiff_nodeLeaf = function (nodeLength) {

    /**
     * Test if given nodes are leafs;
     * Don't have children
     *
     * @param {Element} a
     * @param {Element} b
     * @return {Boolean}
     */
    return function nodeLeaf(a, b) {
      return nodeLength(a) === 0 && nodeLength(b) === 0;
    };
  }(domdiff_nodeLength);
  domdiff_nodeSame = function nodeSame(a, b) {
    if (a.nodeType !== b.nodeType) {
      return false;
    }
    if (a.nodeName !== b.nodeName) {
      return false;
    }
    return true;
  };
  domdiff_attrIntersection = function attrIntersection(aAttr, bAttr) {
    var name, result = [];
    Array.prototype.forEach.call(aAttr, function (value) {
      name = value.nodeName;
      if (name && bAttr[name]) {
        result.push(name);
      }
    });
    return result;
  };
  domdiff_attrDifference = function attrDifference(aAttr, bArray) {
    var result = [];
    Array.prototype.forEach.call(aAttr, function (value) {
      if (-1 === bArray.indexOf(value.nodeName)) {
        result.push(value.nodeName);
      }
    });
    return result;
  };
  domdiff_nodeAttrRemove = function nodeAttrRemove(namespace, name) {
    return namespace + '.removeAttribute("' + name + '");\n';
  };
  domdiff_nodeAttrReplace = function nodeAttrReplace(fromNamespace, toNamespace, name) {
    return toNamespace + '.setAttribute("' + name + '", ' + fromNamespace + '.getAttribute("' + name + '"));\n';
  };
  domdiff_nodeAttrValueEqual = function nodeAttrValueEqual(a, b, name) {
    return a.attributes[name].value === b.attributes[name].value;
  };
  domdiff_diffAttributes = function (attrIntersection, attrDifference, nodeAttrRemove, nodeAttrReplace, nodeAttrValueEqual) {

    /**
     * Calculate diff actions to make 'a' attributes the exactly the same as in 'b'
     *
     * @param {Element} a
     * @param {Element} b
     * @param {NamespaceString} namespaceA
     * @param {NamespaceString} namespaceB
     * @return {String}
     */
    return function diffAttributes(a, b, namespaceA, namespaceB) {
      var common, remove, create, result = '';
      // Calculate changes in attributes
      common = attrIntersection(a.attributes, b.attributes);
      remove = attrDifference(a.attributes, common);
      create = attrDifference(b.attributes, common);
      // Generate actions
      common.forEach(function (name) {
        if (!nodeAttrValueEqual(a, b, name)) {
          result += nodeAttrReplace(namespaceB, namespaceA, name);
        }
      });
      remove.forEach(function (name) {
        result += nodeAttrRemove(namespaceA, name);
      });
      create.forEach(function (name) {
        result += nodeAttrReplace(namespaceB, namespaceA, name);
      });
      return result;
    };
  }(domdiff_attrIntersection, domdiff_attrDifference, domdiff_nodeAttrRemove, domdiff_nodeAttrReplace, domdiff_nodeAttrValueEqual);
  domdiff_nodeRetrieve = function nodeRetrieve(node, index) {
    return node.childNodes[index];
  };
  domdiff_nodeAction = function nodeAction(namespace, action, nodePath) {
    return namespace + '.' + action + '(' + nodePath + ');\n';
  };
  domdiff_nodeRemove = function (nodeAction) {

    /**
     * Generate action to remove namespace from dom
     *
     * @param {NamespaceString} namespace
     * @return {String}
     */
    return function nodeRemove(namespace) {
      return nodeAction(namespace.parent(), 'removeChild', namespace);
    };
  }(domdiff_nodeAction);
  domdiff_nodeAppend = function (nodeAction) {

    /**
     * Generate action to append {newNamespace} into {namespace}
     *
     * @param {NamespaceString} newNamespace
     * @param {NamespaceString} namespace
     * @return {String}
     */
    return function nodeAppend(newNamespace, namespace) {
      return nodeAction(namespace, 'appendChild', newNamespace);
    };
  }(domdiff_nodeAction);
  domdiff_nodeReplace = function nodeReplace(newNamespace, oldNamespace) {
    return oldNamespace.parent() + '.replaceChild(' + newNamespace + ', ' + oldNamespace + ');\n';
  };
  domdiff_nodeExactly = function (nodeSame) {

    /**
     * Check if given nodes are exacly the same
     * (textContent and nodeName are equal)
     *
     * @param {Element} a
     * @param {Element} b
     * @return {Boolean}
     */
    return function nodeExactly(a, b) {
      return a.textContent === b.textContent && nodeSame(a, b);
    };
  }(domdiff_nodeSame);
  domdiff_diff = function (NamespaceString, NamespaceNext, nodeLeaf, nodeSame, diffAttributes, nodeLength, nodeRetrieve, nodeRemove, nodeAppend, nodeReplace, nodeExactly) {

    /**
     * Create DOM API diff from given elements
     *
     * @param {Element} a
     * @param {Element} b
     * @return {String}
     */
    return function diff(rootA, rootB) {

      /**
       * Helper function
       *
       * @param {Element} a
       * @param {Element} b
       * @param {NamespaceString} namespaceA
       * @param {NamespaceString} namespaceB
       * @return {string}
       */
      function diffRecursive(a, b, namespaceA, namespaceB) {

        if (a.classList && b.classList) {
          if (a.classList.length && b.classList.length) {
            if (a.classList.contains('dontdiff') || b.classList.contains('dontdiff'))
              return;
          }

        }


        var i, length, delta, isLeaf, isSame, result = '';
        isLeaf = nodeLeaf(a, b);
        isSame = nodeSame(a, b);
        // Node are the same so compare difference in attributes
        // Add attributes only for element type nodes
        if (isSame && a.nodeType === 1) {
          result += diffAttributes(a, b, namespaceA, namespaceB);
        }

        // Nodes are the same, compare children
        if (!isLeaf && isSame) {
          length = nodeLength(a);
          delta = length - nodeLength(b);
          // Create namespace for children
          namespaceA = namespaceA.next();
          namespaceB = namespaceB.next();
          if (delta > 0) {
            // 'b' has lesser length so we need to reduce
            // 'a' loop length to 'b' length; if we haven't do this
            // then we would have null elements in nodeB var
            length -= delta;
          }
          for (i = 0; i < length; i++) {
            result += diffRecursive(nodeRetrieve(a, i), nodeRetrieve(b, i), namespaceA, namespaceB);
            // Push namespace child further
            namespaceA.push();
            namespaceB.push();
          }
          if (delta > 0) {
            // remove unused elements form 'a' node
            do {
              // We use the same 'path' for removed elements because
              // When removing element at index 1, element at index 2 changes its possition
              // and became element at position 1
              result += nodeRemove(namespaceA);
            } while (--delta > 0);
          } else if (delta < 0) {
            // the 'a' node have less children than the 'b' node
            // then since we compare all common 'a' and 'b' nodes
            // then we need add remaining 'b' nodes
            do {
              result += nodeAppend(namespaceB, namespaceA.parent());
            } while (++delta < 0);
          }
        } // No relation, use b remove a
        else if (!nodeExactly(a, b)) {
          result += nodeReplace(namespaceB, namespaceA);
          // When we replace element A with B then B's children number decremented
          namespaceB.pop();
        }

        return result;
      }
      // Perform two node comparison
      return diffRecursive(rootA, rootB, new NamespaceString('aElement'), new NamespaceString('bElement'));
    };
  }(domdiff_NamespaceString, domdiff_NamespaceNext, domdiff_nodeLeaf, domdiff_nodeSame, domdiff_diffAttributes, domdiff_nodeLength, domdiff_nodeRetrieve, domdiff_nodeRemove, domdiff_nodeAppend, domdiff_nodeReplace, domdiff_nodeExactly);
  domdiff_applyDiff = function (diff) {

    /**
     * Apply on element 'a' changes from 'b' using given diff
     *
     * @param {Element} a
     * @param {Element} b
     * @param {String} diff
     */
    return function applyDiff(a, b, diff) {
      return new Function('aElement', 'bElement', diff)(a, b);
    };
  }(domdiff_diff);
  if (true) {
    jquery = function () {
      return window.jQuery;
    }();
  }
  integration_jquerydiffhtml = function (diff, applyDiff, jQuery) {

    jQuery.fn.diffhtml = function (html) {
      if (typeof html == 'object')
        if (typeof html.html == 'function')
          html = html.html();
      var ref, diffRef;

      console.log(this);
      return this.map(function () {
        // Create clone
        ref = this.cloneNode(false);
        // Create in memory DOM nodes
        ref.innerHTML = html;

        // Compare document state with memory state
        diffRef = diff(this, ref);
        // Apply difference
        applyDiff(this, ref, diffRef);
        return this;
      });
    };
    return jQuery;
  }(domdiff_diff, domdiff_applyDiff, jquery);
}());
