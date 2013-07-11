/**
 * Scrawl is a simple markdown plugin for Craft CMS providing a fieldtype and a twig filter.
 *
 * This editor is inspired by https://github.com/lepture/editor
 *
 * @package   Craft Scrawl
 * @author    Mario Friz
 */

var toolbar = [
  'bold', 'italic', '|',
  'h1', 'h2', 'h3', '|',
  'quote', 'unordered-list', 'ordered-list', '|',
  'link', 'image', '|',
  'undo', 'redo', '|',
  'fullscreen'
];

function Editor(options) {
  this.init(options);
}

Editor.prototype.init = function(options) {
  // Hide preloader
  $('.scrawl-loading').addClass('hidden');

  options = options || {};
  if (options.element) {
    this.element = options.element;
  }
  options.toolbar = options.toolbar || toolbar;
  // you can customize toolbar with object
  // [{name: 'bold', shortcut: 'Ctrl-B', className: 'icon-bold'}]

  if (!options.hasOwnProperty('status')) {
    options.status = ['lines', 'words', 'cursor'];
  }

  this.options = options;
};

Editor.prototype.render = function(el) {
  if (!el) {
    el = this.element || document.getElementsByTagName('textarea')[0];
  }
  this.element = el;
  var options = this.options;

  var self = this;

  this.codemirror = CodeMirror.fromTextArea(el, {
    mode: 'markdown',
    theme: 'paper',
    indentWithTabs: true,
    lineNumbers: false
  });

  if (options.toolbar !== false) {
    this.createToolbar();
  }
  if (options.status !== false) {
    this.createStatusbar();
  }
};

Editor.prototype.createToolbar = function(tools) {
  tools = tools || this.options.toolbar;

  if (!tools || tools.length === 0) return;

  var bar = document.createElement('ul');
  bar.className = 'scrawl-toolbar';

  var self = this;

  var el;
  self.toolbar = {};

  for (var i = 0; i < tools.length; i++) {
    (function(tool) {
      var li = document.createElement('li');
      var name, action, className;
      
      name = tool;

      if (name == '|') {
        li.className = "separator";
      }
      else {
        if (name == 'fullscreen') {
          li.className = 'right';
        }
        el = createIcon(name);

        el.onclick = function() {
          return self.action(name);
        };
        
        self.toolbar[name] = el;
        li.appendChild(el);
      }
      bar.appendChild(li);
    })(tools[i]);
  }

  var cm = this.codemirror;
  cm.on('cursorActivity', function() {
    var stat = getState(cm);

    for (var key in self.toolbar) {
      (function(key) {
        var el = self.toolbar[key];
        if (stat[key]) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      })(key);
    }
  });


  var cmWrapper = cm.getWrapperElement();
  cmWrapper.parentNode.insertBefore(bar, cmWrapper);
  return bar;
};

Editor.prototype.createStatusbar = function(status) {
  status = status || this.options.status;

  if (!status || status.length === 0) return;

  var bar = document.createElement('div');
  bar.className = 'editor-statusbar';

  var pos, cm = this.codemirror;
  for (var i = 0; i < status.length; i++) {
    (function(name) {
      var el = document.createElement('span');
      el.className = name;
      if (name === 'words') {
        el.innerHTML = '0';
        cm.on('update', function() {
          el.innerHTML = cm.getValue().length;
        });
      } else if (name === 'lines') {
        el.innerHTML = '0';
        cm.on('update', function() {
          el.innerHTML = cm.lineCount();
        });
      } else if (name === 'cursor') {
        el.innerHTML = '0:0';
        cm.on('cursorActivity', function() {
          pos = cm.getCursor();
          el.innerHTML = pos.line + ':' + pos.ch;
        });
      }
      bar.appendChild(el);
    })(status[i]);
  }
  var cmWrapper = this.codemirror.getWrapperElement();
  cmWrapper.parentNode.insertBefore(bar, cmWrapper.nextSibling);
  return bar;
};

Editor.prototype.action = function(name, cm) {
  cm = cm || this.codemirror;
  if (!cm) return;

  var stat = getState(cm);

  var replaceSelection = function(start, end) {
    var text;
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    if (stat[name]) {
      text = cm.getLine(startPoint.line);
      start = text.slice(0, startPoint.ch);
      end = text.slice(startPoint.ch);
      if (name === 'bold') {
        start = start.replace(/^(.*)?(\*|\_){2}(\S+.*)?$/, '$1$3');
        end = end.replace(/^(.*\S+)?(\*|\_){2}(\s+.*)?$/, '$1$3');
        startPoint.ch -= 2;
        endPoint.ch -= 2;
      } else if (name === 'italic') {
        start = start.replace(/^(.*)?(\*|\_)(\S+.*)?$/, '$1$3');
        end = end.replace(/^(.*\S+)?(\*|\_)(\s+.*)?$/, '$1$3');
        startPoint.ch -= 1;
        endPoint.ch -= 1;
      }
      cm.setLine(startPoint.line, start + end);
      cm.setSelection(startPoint, endPoint);
      cm.focus();
      return;
    }
    if (end === null) {
      end = '';
    } else {
      end = end || start;
    }
    text = cm.getSelection();
    cm.replaceSelection(start + text + end);

    startPoint.ch += start.length;
    endPoint.ch += start.length;
    cm.setSelection(startPoint, endPoint);
    cm.focus();
  };

  var toggleLine = function() {
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var repl = {
      quote: /^(\s*)\>\s+/,
      'unordered-list': /^(\s*)(\*|\-|\+)\s+/,
      'ordered-list': /^(\s*)\d+\.\s+/,
      h1: /^(\s*)\>\s+/,
      h2: /^(\s*)\>\s+/,
      h3: /^(\s*)\>\s+/
    };
    var map = {
      quote: '> ',
      'unordered-list': '* ',
      'ordered-list': '1. ',
      h1: '# ',
      h2: '## ',
      h3: '### '
    };
    for (var i = startPoint.line; i <= endPoint.line; i++) {
      (function(i) {
        var text = cm.getLine(i);
        if (stat[name]) {
          text = text.replace(repl[name], '$1');
        } else {
          text = map[name] + text;
        }
        cm.setLine(i, text);
      })(i);
    }
    cm.focus();
  };

  switch (name) {
    case 'bold':
      replaceSelection('**');
      break;
    case 'italic':
      replaceSelection('*');
      break;
    case 'link':
      replaceSelection('[', '](http://)');
      break;
    case 'image':
      replaceSelection('![', '](http://)');
      break;
    case 'quote':
    case 'unordered-list':
    case 'ordered-list':
    case 'h1':
    case 'h2':
    case 'h3':
      toggleLine();
      break;
    case 'undo':
      cm.undo();
      cm.focus();
      break;
    case 'redo':
      cm.redo();
      cm.focus();
      break;
    case 'fullscreen':
      toggleFullScreen(cm);
      break;
  }
};

function getState(cm, pos) {
  pos = pos || cm.getCursor('start');
  var stat = cm.getTokenAt(pos);
  if (!stat.type) return {};

  var types = stat.type.split(' ');

  var ret = {}, data, text;
  for (var i = 0; i < types.length; i++) {
    data = types[i];
    if (data === 'strong') {
      ret.bold = true;
    } else if (data === 'variable-2') {
      text = cm.getLine(pos.line);
      if (/^\s*\d+\.\s/.test(text)) {
        ret['ordered-list'] = true;
      } else {
        ret['unordered-list'] = true;
      }
    } else if (data === 'atom') {
      ret.quote = true;
    } else if (data === 'em') {
      ret.italic = true;
    }
  }
  return ret;
}
function formatName(text) {
  return text.charAt(0).toUpperCase() + text.replace('-', ' ').slice(1);;
}

var createIcon = function(name, options) {
  options = options || {};
  var el;
  if (name === '|') {
    el = document.createElement('i');
    el.className = 'separator';
    el.innerHTML = '|';
    return el;
  }
  el = document.createElement('a');
  el.title = formatName(name);

  el.className = 'icon-' + name;

  return el;
};

function winHeight() {
  return window.innerHeight || (document.documentElement || document.body).clientHeight;
}

function toggleFullScreen(cm) {
  var el = cm.getWrapperElement();
  var wrapper = el.parentNode;
  var preview = wrapper.querySelector('.preview');
  if (/\bfullscreen\b/.test(wrapper.className)) {
    wrapper.style.height = "auto";
    wrapper.className = wrapper.className.replace(" fullscreen", "");
    cm.off('change');
    el.style.height = "auto";
    document.getElementsByTagName("html")[0].style.overflow = "auto";
  }
  else {
    preview.innerHTML = marked(cm.getValue());
    cm.on('change', function(instance) {
      preview.innerHTML = marked(cm.getValue());
    });
    var toolbarheight = 80;
    wrapper.className += " fullscreen";
    preview.style.height = (winHeight() - toolbarheight) + "px";
    wrapper.style.height = (winHeight() - 8) + "px";
    el.style.height = (winHeight() - toolbarheight) + "px";
    document.getElementsByTagName("html")[0].style.overflow = "hidden";
  }

  CodeMirror.on(window, "resize", function() {
    preview.style.height = (winHeight() - toolbarheight) + "px";
    wrapper.style.height = (winHeight() - 8) + "px";
    el.style.height = (winHeight() - toolbarheight) + "px";
  });
}