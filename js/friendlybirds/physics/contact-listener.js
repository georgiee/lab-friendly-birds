define(['augment'], function(augment){
  var ContactListener = augment.defclass({
    constructor: function(){

    },
    
    BeginContact: function (contact) {
        this.handleContactBeginOrEnd(contact, true);
    },
    
    EndContact: function (contact) {
        this.handleContactBeginOrEnd(contact, false);
    },
    
    handleContactBeginOrEnd: function (contact, begin){
        var fA = contact.GetFixtureA();
        var fB = contact.GetFixtureB();
        var bA = fA.GetBody();
        var bB = fB.GetBody();
        var catA = fA.GetFilterData().categoryBits;
        var catB = fB.GetFilterData().categoryBits;
        var pA = bA.parent;
        var pB = bB.parent;
        var idA = pA.id;
        var idB = pB.id;
        
        // Check body callbacks
        if (pA._bodyContactCallbacks[idB])
        {
            pA._bodyContactCallbacks[idB].call(pA._bodyContactCallbackContext[idB], pA, pB, fA, fB, begin, contact);
        }

        if (pB._bodyContactCallbacks[idA])
        {
            pB._bodyContactCallbacks[idA].call(pB._bodyContactCallbackContext[idA], pB, pA, fB, fA, begin, contact);
        }   
            
        // Check fixture callbacks
        if (pA._fixtureContactCallbacks[fB.id])
        {
            pA._fixtureContactCallbacks[fB.id].call(pA._fixtureContactCallbackContext[fB.id], pA, pB, fA, fB, begin, contact);
        }

        if (pB._fixtureContactCallbacks[fA.id])
        {
            pB._fixtureContactCallbacks[fA.id].call(pB._fixtureContactCallbackContext[fA.id], pB, pA, fB, fA, begin, contact);
        }   
            
        if (pA._fixtureContactCallbacks[fA.id])
        {
            pA._fixtureContactCallbacks[fA.id].call(pA._fixtureContactCallbackContext[fA.id], pA, pA, fA, fA, begin, contact);
        }

        if (pB._fixtureContactCallbacks[fB.id])
        {
            pB._fixtureContactCallbacks[fB.id].call(pB._fixtureContactCallbackContext[fB.id], pB, pB, fB, fB, begin, contact);
        }
        
        // Check group callbacks
        if (pA._categoryContactCallbacks[catB])
        {
            pA._categoryContactCallbacks[catB].call(pA._categoryContactCallbackContext[catB], pA, pB, fA, fB, begin, contact);
        }

        if (pB._categoryContactCallbacks[catA])
        {
            pB._categoryContactCallbacks[catA].call(pB._categoryContactCallbackContext[catA], pB, pA, fB, fA, begin, contact);
        }
        
        if (pA._categoryContactCallbacks[catA])
        {
            pA._categoryContactCallbacks[catA].call(pA._categoryContactCallbackContext[catA], pA, pA, fA, fA, begin, contact);
        }

        if (pB._categoryContactCallbacks[catB])
        {
            pB._categoryContactCallbacks[catB].call(pB._categoryContactCallbackContext[catB], pB, pB, fB, fB, begin, contact);
        }

    },

    PreSolve: function (contact, oldManifold){
        var fA = contact.GetFixtureA();
        var fB = contact.GetFixtureB();
        var bA = fA.GetBody();
        var bB = fB.GetBody();
        var catA = fA.GetFilterData().categoryBits;
        var catB = fB.GetFilterData().categoryBits;
        var pA = bA.parent;
        var pB = bB.parent;
        var idA = pA.id;
        var idB = pB.id;

        // Check body callbacks
        if (pA._bodyPresolveCallbacks[idB])
        {
            pA._bodyPresolveCallbacks[idB].call(pA._bodyPresolveCallbackContext[idB], pA, pB, fA, fB, contact, oldManifold);
        }

        if (pB._bodyPresolveCallbacks[idA])
        {
            pB._bodyPresolveCallbacks[idA].call(pB._bodyPresolveCallbackContext[idA], pB, pA, fB, fA, contact, oldManifold);
        }   
            
        // Check fixture callbacks
        if (pA._fixturePresolveCallbacks[fB.id])
        {
            pA._fixturePresolveCallbacks[fB.id].call(pA._fixturePresolveCallbackContext[fB.id], pA, pB, fA, fB, contact, oldManifold);
        }

        if (pB._fixturePresolveCallbacks[fA.id])
        {
            pB._fixturePresolveCallbacks[fA.id].call(pB._fixturePresolveCallbackContext[fA.id], pB, pA, fB, fA, contact, oldManifold);
        }
        
        // Check group callbacks
        if (pA._categoryPresolveCallbacks[catB])
        {
            pA._categoryPresolveCallbacks[catB].call(pA._categoryPresolveCallbackContext[catB], pA, pB, fA, fB, contact, oldManifold);
        }

        if (pB._categoryPresolveCallbacks[catA])
        {
            pB._categoryPresolveCallbacks[catA].call(pB._categoryPresolveCallbackContext[catA], pB, pA, fB, fA, contact, oldManifold);
        }

    },

    PostSolve: function (contact, impulse){
        var fA = contact.GetFixtureA();
        var fB = contact.GetFixtureB();
        var bA = fA.GetBody();
        var bB = fB.GetBody();
        var catA = fA.GetFilterData().categoryBits;
        var catB = fB.GetFilterData().categoryBits;
        var pA = bA.parent;
        var pB = bB.parent;
        var idA = pA.id;
        var idB = pB.id;

        // Check body callbacks
        if (pA._bodyPostsolveCallbacks[idB])
        {
            pA._bodyPostsolveCallbacks[idB].call(pA._bodyPostsolveCallbackContext[idB], pA, pB, fA, fB, contact, impulse);
        }

        if (pB._bodyPostsolveCallbacks[idA])
        {
            pB._bodyPostsolveCallbacks[idA].call(pB._bodyPostsolveCallbackContext[idA], pB, pA, fB, fA, contact, impulse);
        }   
            
        // Check fixture callbacks
        if (pA._fixturePostsolveCallbacks[fB.id])
        {
            pA._fixturePostsolveCallbacks[fB.id].call(pA._fixturePostsolveCallbackContext[fB.id], pA, pB, fA, fB, contact, impulse);
        }

        if (pB._fixturePostsolveCallbacks[fA.id])
        {
            pB._fixturePostsolveCallbacks[fA.id].call(pB._fixturePostsolveCallbackContext[fA.id], pB, pA, fB, fA, contact, impulse);
        }
        
        // Check group callbacks
        if (pA._categoryPostsolveCallbacks[catB])
        {
            pA._categoryPostsolveCallbacks[catB].call(pA._categoryPostsolveCallbackContext[catB], pA, pB, fA, fB, contact, impulse);
        }

        if (pB._categoryPostsolveCallbacks[catA])
        {
            pB._categoryPostsolveCallbacks[catA].call(pB._categoryPostsolveCallbackContext[catA], pB, pA, fB, fA, contact, impulse);
        }

    }

  });


return ContactListener;
});