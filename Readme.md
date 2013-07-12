# Craft Scrawl

Scrawl is a plugin for [Craft](http://buildwithcraft.com), which allows
you to add markdown content to your website using a simple editor based on Codemirror and a Twig filter.

The project page is <http://builtbysplash.com/projects/craft-scrawl>  
The documentation is at <http://builtbysplash.com/projects/craft-scrawl/docs>

## Installation 

Simply follow these 2 steps:

* Rename the folder to **scrawl** and copy it into your **craft/plugins/** folder. Ex, **craft/plugins/scrawl**
* Go to **settings/plugins** and install scrawl

## Credits

This plugin uses components of the following projects:

* CodeMirror: <https://github.com/marijnh/CodeMirror>
* Craft-markdown: <https://github.com/Natetronn/craft.markdown>
* Editor: <https://github.com/lepture/editor>

## Contributing

There is a phing build script provided in the **build/** folder, it will concatenate and minify the CSS and JS using this command:

    php phing.phar

If you want to modify some JS or CSS files without rebuilding everytime, you can edit *ScrawlPlugin.php* and change:

    public static $devMode = false;
    
to
    
    public static $devMode = true;
    
This will make Scrawl use the uncompiled CSS and JS files instead.

Enjoy!
