<?php

namespace Croogo\FileManager\Controller\Admin;

use Cake\Event\Event;

/**
 * Attachments Controller
 *
 * This file will take care of file uploads (with rich text editor integration).
 *
 * @category FileManager.Controller
 * @package  Croogo.FileManager.Controller
 * @version  1.0
 * @author   Fahad Ibnay Heylaal <contact@fahad19.com>
 * @license  http://www.opensource.org/licenses/mit-license.php The MIT License
 * @link     http://www.croogo.org
 */
class AttachmentsController extends AppController
{

    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('Search.Prg', ['actions' => 'index']);
        $this->viewBuilder()->helpers(['Croogo/FileManager.FileManager', 'Croogo/Core.Image']);
    }

    /**
     * Before executing controller actions
     *
     * @return void
     * @access public
     */
    public function beforeFilter(Event $event)
    {
        parent::beforeFilter($event);

        $this->set('type', $this->Attachments->type);

        if ($this->action == 'add') {
            $this->Security->csrfCheck = false;
        }

        $this->paginate = [
            'order' => [
                'created' => 'DESC',
            ],
        ];
    }

    public function implementedEvents()
    {
        return parent::implementedEvents() + [
            'Crud.beforePaginate' => 'beforePaginate',
            'Crud.beforeRedirect' => 'beforeCrudRedirect',
        ];
    }

    /**
     * Admin index
     *
     * @return void
     * @access public
     */
    public function beforePaginate(Event $event)
    {
        $isChooser = false;
        if (isset($this->request->params['links']) || $this->request->query('chooser')) {
            $isChooser = true;
        }

        if ($isChooser) {
            if ($this->request->query['chooser_type'] == 'image') {
                $event->subject()->query->where(['mime_type LIKE' => 'image/%']);
            } else {
                $event->subject()->query->where(['mime_type NOT LIKE' => 'image/%']);
            }
        }
        $this->set('uploadsDir', $this->Attachments->uploadsDir);
    }

    public function beforeCrudRedirect(Event $event)
    {
        if (isset($this->request->params['editor'])) {
            $event->subject()->url = $this->redirect(['action' => 'browse']);
        }
    }

    /**
     * Admin browse
     *
     * @return void
     * @access public
     */
    public function browse()
    {
        $this->viewBuilder()->layout('admin_popup');
        $this->setAction('index');
        $this->request->params['action'] = 'browse'; //Reset the action value
        return $this->render('browse');
    }
}
